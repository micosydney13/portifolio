import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Service } from '../../types';

interface ServicesSectionProps {
  services: Service[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  const enabledServices = services.filter((s) => s.enabled);
  if (enabledServices.length === 0) return null;

  return (
    <section id="services" className="py-24 md:py-32 border-b border-neutral-200 bg-neutral-50/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 tracking-tight">
            Services & Development Capabilities
          </h2>
          <div className="w-12 h-0.5 bg-black" />
          <p className="text-sm text-neutral-600 max-w-xl">
            Full-stack engineering, API architecture, performance audits, and freelance contract development.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {enabledServices.map((service) => (
            <div
              key={service.id}
              className="border border-neutral-200 bg-white p-8 flex flex-col justify-between hover:border-black transition-colors duration-300 space-y-8 group"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-end border-b border-neutral-100 pb-4">
                  <div className="w-2 h-2 rounded-full bg-black group-hover:scale-125 transition-transform" />
                </div>

                <h3 className="text-xl font-display font-bold text-neutral-950 leading-snug">
                  {service.title}
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {service.description}
                </p>

                {service.features && service.features.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                    <span className="text-[10px] font-mono-code uppercase tracking-wider text-neutral-400 block">
                      Scope & Deliverables:
                    </span>
                    <ul className="space-y-2">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-700">
                          <Check className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-neutral-900 group-hover:text-black group-hover:underline underline-offset-4"
                >
                  <span>Inquire Regarding Scope</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
