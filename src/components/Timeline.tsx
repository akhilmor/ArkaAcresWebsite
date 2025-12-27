interface TimelineItem {
  time: string
  title: string
  description: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Vertical line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-neutral-300 transform md:-translate-x-0.5" />

      <div className="space-y-8">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative flex items-start md:items-center"
          >
            {/* Time badge */}
            <div className="flex-shrink-0 w-24 md:w-32 text-right pr-4 md:pr-6">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full">
                {item.time}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-lg p-6 shadow-sm ml-4 md:ml-6">
              <h3 className="text-lg font-serif text-earth-800 font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-neutral-600">{item.description}</p>
            </div>

            {/* Dot */}
            <div className="absolute left-4 md:left-1/2 top-6 w-3 h-3 bg-primary rounded-full transform -translate-x-1.5 md:-translate-x-1.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

