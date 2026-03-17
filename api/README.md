# TCDA API Integration Notes

This folder contains a Cloudflare Worker style example for secure checkout and fulfillment endpoints.

## Endpoints

- `POST /api/checkout/stripe-session`
- `POST /api/fulfillment/printful-order`
- `GET /api/catalog`

## Required Secrets

- `STRIPE_SECRET_KEY`
- `PRINTFUL_API_KEY`

## Why this architecture

- Keeps payment and fulfillment secrets off the frontend
- Compatible with HTTPS and Cloudflare edge deployment
- Matches the frontend integration in `assets/js/commerce.js`
