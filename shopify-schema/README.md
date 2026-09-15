# Structured data for the new Kill Cliff theme

Six drop-in Liquid snippets. They close every structured-data gap Google reports
on killcliff.com today, so the new theme launches with them instead of needing a
retrofit afterwards.

## Install

Copy all six `.liquid` files into the theme's `snippets/` folder, then render them:

| Snippet | Render in | How |
|---|---|---|
| `schema-organization` | `layout/theme.liquid` `<head>` | `{% render 'schema-organization' %}` (once, every page) |
| `schema-breadcrumbs` | product, collection, article, blog, page templates | `{% render 'schema-breadcrumbs' %}` |
| `schema-product` | `templates/product.liquid` | `{% render 'schema-product', product: product %}` |
| `schema-collection` | `templates/collection.liquid` | `{% render 'schema-collection', collection: collection %}` |
| `schema-article` | `templates/article.liquid` | `{% render 'schema-article', article: article, blog: blog %}` |
| `schema-blog` | `templates/blog.liquid` | `{% render 'schema-blog', blog: blog %}` |

Remove any JSON-LD the starter theme ships with first. Two competing Product
blocks on one page is worse than none.

## What each one fixes

**Product.** Google's URL Inspection currently returns three warnings on every
product page: the Product snippet is missing `review` and `aggregateRating`, and
the Merchant listing is missing `shippingDetails`, `hasMerchantReturnPolicy` and
`validFrom`. This snippet supplies all of them.

Ratings read the native `reviews.rating` and `reviews.rating_count` metafields,
which Okendo maintains. **Do not bind to `yotpo.*` or `stamped.*`.** Both apps are
retired but their metafields are still on the products holding stale numbers that
disagree with each other. Elk Blood carries Okendo 4.7 from 89 reviews, Yotpo 4.9
from 295, and Stamped 4.8 from 170. Only Okendo is current.

The rating block is skipped entirely when a product has no reviews. Emitting an
aggregateRating with a zero count is a structured-data error.

**Shipping and returns are stated from the live store settings:** $7.99 US ground
on a single item, free over $125. Returns follow the published refund policy, so
apparel gets a 14 day window and drinks and powders get
`MerchantReturnNotPermitted`, because the policy says returns do not apply to food
and beverage. Confirm that reading with whoever owns the policy before launch. It
is a legal statement, not a formatting choice.

**Article.** The old theme did emit Article JSON-LD, but it used `http://schema.org`,
typed posts as generic `Article`, inlined the entire article body into the page as
`articleBody`, and set `publisher.logo` to the post's own photo. This version uses
`BlogPosting`, links the publisher to the shared Organization node, and carries a
real description.

**Collection, Blog, Breadcrumbs, Organization.** The current site emits none of
these on collection or blog pages. Breadcrumbs are the visible win: Google shows
them in the result in place of the raw URL.

## Depends on

`schema-product`, `schema-article` and `schema-collection` all reference
`#organization`, so `schema-organization` must render on every page.

Article and collection descriptions read the `global.description_tag` metafield
first and fall back to body text. Those metafields were written for all 534
published articles ahead of the migration, so the fallback should rarely fire.

## Verify after launch

Run each template through the Rich Results Test, then watch Search Console's
Merchant listings and Review snippets reports for a week.
