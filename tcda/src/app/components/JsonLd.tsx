import { Helmet } from "react-helmet-async";

interface Props {
  type: string;
  data: Record<string, unknown>;
}

export function JsonLd({ data }: Props) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
