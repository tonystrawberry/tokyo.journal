export default {
  name: 'quest',
  title: 'Quest',
  type: 'document',
  fields: [
    {
      name: 'area',
      title: 'Area',
      type: 'string',
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
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
      name: 'waypoints',
      title: 'Waypoints',
      type: 'array',
      of: [ { type: 'reference', to: { type: 'place' } }, { type: 'geopoint' } ],
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
