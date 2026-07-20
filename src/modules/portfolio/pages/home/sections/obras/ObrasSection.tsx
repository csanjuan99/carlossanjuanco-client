import { useContent } from '@/shared/content/ContentProvider'
import BlindsReveal from '@/shared/components/blinds-reveal/BlindsReveal'
import BrushWipeImage from '@/shared/components/brush-wipe-image/BrushWipeImage'
import { formatPlateLabel } from './format-plate-label'

export default function ObrasSection() {
  const { content } = useContent()
  const { obrasSection, projects } = content

  return (
    <section className="py-24 md:py-32">
      <BlindsReveal className="mb-16 px-6 text-center">
        <div className="mb-4 font-mono text-[11px] tracking-[0.34em] text-sienna">{obrasSection.label}</div>
        <h2 className="font-fraunces text-[clamp(36px,5vw,64px)] font-medium tracking-tight">{obrasSection.title}</h2>
      </BlindsReveal>

      {projects.map((project) => (
        <article
          key={project.documentId}
          className="mx-auto grid min-h-screen max-w-[1240px] grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-16"
        >
          <div>
            <div className="font-fraunces text-[clamp(64px,9vw,130px)] font-light italic leading-none text-sienna/30">
              {obrasSection.numeralPrefix} {project.numeral}
            </div>
            <h3 className="mb-4 mt-2 font-fraunces text-[clamp(30px,3.6vw,52px)] font-semibold tracking-tight">
              {project.title}
            </h3>
            <p className="mb-8 max-w-[46ch] text-lg leading-relaxed text-ink/75">
              {project.description}
            </p>

            <div className="grid max-w-[520px] grid-cols-[110px_1fr] gap-x-4 gap-y-2 border-t border-sienna/30 pt-5 font-mono text-xs tracking-wider">
              <span className="tracking-[0.24em] text-sienna">{obrasSection.technique}</span>
              <span className="text-ink/80">{project.stack}</span>
              <span className="tracking-[0.24em] text-sienna">{obrasSection.role}</span>
              <span className="text-ink/80">{project.role}</span>
              <span className="tracking-[0.24em] text-sienna">{obrasSection.year}</span>
              <span className="text-ink/80">{project.year}</span>
              <span className="tracking-[0.24em] text-sienna">{obrasSection.result}</span>
              <span className="text-ink/80">{project.result}</span>
            </div>

            <a
              href={project.link}
              className="mt-7 inline-block border-b border-gold pb-1 font-mono text-xs tracking-[0.26em] text-sienna transition-colors hover:text-gold"
            >
              {obrasSection.cta}
            </a>
          </div>

          <div className="relative">
            <div className="rounded-sm bg-gradient-to-br from-gold-light via-gold to-sienna p-4 shadow-2xl">
              <div className="bg-parchment p-2">
                <BrushWipeImage className="flex h-[clamp(260px,36vw,420px)] w-full items-center justify-center border border-dashed border-sienna/40 bg-parchment-dark">
                  <span className="px-4 text-center font-mono text-xs tracking-[0.2em] text-sienna/70">
                    {obrasSection.imagePlaceholder}
                  </span>
                </BrushWipeImage>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap border border-sienna/30 bg-parchment px-4 py-1.5 font-mono text-[10px] tracking-[0.3em] text-sienna shadow-lg">
              {formatPlateLabel(obrasSection.plateLabel, project.numeral, project.year)}
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
