#!/bin/bash
# Convert JPEG/JPG product images in R2 to WebP, update DB URLs
set -euo pipefail

source ~/app/.env

ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
AWS="~/.local/bin/aws"
AWS_CMD="$AWS s3 --endpoint-url $ENDPOINT"

export AWS_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION=auto

TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

echo "=== Listing JPEG/JPG files in R2 ==="
$AWS_CMD ls "s3://${R2_BUCKET_NAME}/products/" --recursive \
  | awk '{print $4}' \
  | grep -iE '\.(jpeg|jpg)$' > "$TMP_DIR/jpeg_list.txt"

COUNT=$(wc -l < "$TMP_DIR/jpeg_list.txt")
echo "Found: $COUNT files"
cat "$TMP_DIR/jpeg_list.txt"

if [ "$COUNT" -eq 0 ]; then
  echo "Nothing to convert."
  exit 0
fi

echo ""
echo "=== Converting ==="

while IFS= read -r KEY; do
  WEBP_KEY="${KEY%.*}.webp"
  FNAME=$(basename "$KEY")
  FNAME_WEBP="${FNAME%.*}.webp"
  SRC="$TMP_DIR/$FNAME"
  DST="$TMP_DIR/$FNAME_WEBP"

  echo "▶ $KEY"

  # Skip if WebP already exists in R2
  if $AWS_CMD ls "s3://${R2_BUCKET_NAME}/${WEBP_KEY}" &>/dev/null; then
    echo "  WebP already exists — skipping upload, deleting original"
  else
    # Download
    $AWS_CMD cp "s3://${R2_BUCKET_NAME}/${KEY}" "$SRC" --quiet

    # Convert with Pillow
    python3 - "$SRC" "$DST" <<'PY'
import sys
from PIL import Image
img = Image.open(sys.argv[1]).convert("RGB")
img.save(sys.argv[2], "WEBP", quality=85, method=6)
print(f"  Converted: {sys.argv[2]}")
PY

    # Upload WebP
    $AWS_CMD cp "$DST" "s3://${R2_BUCKET_NAME}/${WEBP_KEY}" \
      --content-type "image/webp" --quiet
    echo "  Uploaded: $WEBP_KEY"
  fi

  # Delete original
  $AWS_CMD rm "s3://${R2_BUCKET_NAME}/${KEY}" --quiet
  echo "  Deleted:  $KEY"

  rm -f "$SRC" "$DST"
done < "$TMP_DIR/jpeg_list.txt"

echo ""
echo "=== Updating DB URLs ==="
psql -U sairen sairen_db <<'SQL'
UPDATE products
SET images = ARRAY(
  SELECT
    CASE
      WHEN url ~ '\.(jpeg|jpg)$'
      THEN regexp_replace(url, '\.(jpeg|jpg)$', '.webp', 'i')
      ELSE url
    END
  FROM unnest(images) AS url
)
WHERE images && ARRAY(
  SELECT url FROM unnest(images) AS url WHERE url ~ '\.(jpeg|jpg)$'
);
SQL

echo "Done."
