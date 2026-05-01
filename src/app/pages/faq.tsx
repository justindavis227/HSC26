import { campData } from '../data/camp-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

export function FAQPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Frequently Asked Questions</h1>
        <p className="text-muted-foreground mt-1">Find answers to common questions about camp</p>
      </div>

      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="space-y-2">
          {campData.faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
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
