import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { supabase } from '../../lib/supabase';
import type { FAQ } from '../../lib/supabase';
import { usePageTitle } from '../hooks/use-page-title';

export function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { title, subtitle } = usePageTitle('faq', {
    title: 'Frequently Asked Questions',
    subtitle: 'Find answers to common questions about camp',
  });

  useEffect(() => {
    supabase
      .from('faqs')
      .select('*')
      .order('sort_order')
      .then(({ data }) => { setFaqs(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="max-w-3xl">
        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Loading…</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={String(faq.id)}
                className="bg-white dark:bg-gray-800 border rounded-lg px-6"
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <div className="max-w-3xl mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <h3 className="mb-2">Still have questions?</h3>
        <p className="text-sm text-muted-foreground mb-3">
          If you can't find the answer you're looking for, please don't hesitate to reach out to our camp staff.
        </p>
        <a href="/contacts" className="text-primary hover:underline text-sm">
          View contact information →
        </a>
      </div>
    </div>
  );
}
