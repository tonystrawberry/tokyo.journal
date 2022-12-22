export default {
  name: 'place',
  title: 'Place',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'geopoint',
      title: 'Geopoint',
      type: 'geopoint',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string'
    },
    {
      name: 'picture',
      title: 'Picture',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [ { type: 'reference', to: { type: 'category' } } ],
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    },
    {
      name: 'shortDescription',
      title: 'Short description',
      type: 'string',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image',
          fields: [
            {
              type: 'text',
              name: 'alt',
              title: 'Alternative text',
              description: `Some of your visitors cannot see images,
            be they blind, color-blind, low-sighted;
            alternative text is of great help for those
            people that can rely on it to have a good idea of
            what\'s on your page.`,
              options: {
                isHighlighted: true
              }
            }
          ]
        }
      ]

    },
  ]
}
