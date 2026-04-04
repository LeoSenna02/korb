import Link from "next/link";
import { Droplets, Moon, Scale, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/branding/BrandLogo";

const features = [
  {
    icon: Droplets,
    title: "Mamadas",
    description: "Controle peito, mamadeira e água. Sem adivinhar quando foi a última.",
  },
  {
    icon: Moon,
    title: "Trocas",
    description: "Registre fraldas molhadas e sujas. Acompanha a frequência.",
  },
  {
    icon: Moon,
    title: "Sono",
    description: "Cronometre sonecas e sono noturno. Resgate a memória do sono.",
  },
  {
    icon: Scale,
    title: "Crescimento",
    description: "Peso, altura e cefalia. Gráficos que mostram cada marco.",
  },
];

export default function Onboarding() {
  return (
    <main className="min-h-screen bg-surface-dim flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-12">
        <BrandLogo
          size={96}
          priority
          className="flex-col gap-5 mb-3"
          nameClassName="text-4xl text-text-primary"
        />

        <p className="font-data text-base text-text-secondary text-center max-w-xs leading-relaxed">
          A calma que você precisa, às 3 da manhã.
        </p>
      </section>

      <section className="px-6 pb-8">
        <div className="grid grid-cols-1 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="bg-surface-container rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <Icon
                    className="w-5 h-5 text-text-secondary"
                    strokeWidth={1.5}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-lg text-text-primary mb-1">
                    {feature.title}
                  </h2>
                  <p className="font-data text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-10 pt-4">
        <Link
          href="/login"
          className="w-full h-14 bg-primary-container text-on-primary-container rounded-xl font-display text-base font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:bg-primary active:scale-[0.98]"
        >
          Começar
          <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
        </Link>
      </section>
    </main>
  );
}
