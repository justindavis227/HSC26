import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router';
import { ArrowLeft, MessageCircle, FileText, ArrowRight, ExternalLink, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../../lib/supabase';
import type { DecisionGuide } from '../../lib/supabase';

export function DecisionGuidePage() {
  const [guide, setGuide] = useState<DecisionGuide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('decision_guide').select('*').eq('id', 1).single()
      .then(({ data }) => { setGuide(data as DecisionGuide ?? null); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const decisions: string[] = Array.isArray(guide?.step2_decisions) ? guide!.step2_decisions as string[] : [];
  const nextStepImages = guide ? [
    guide.next_step_image_1_url,
    guide.next_step_image_2_url,
    guide.next_step_image_3_url,
    guide.next_step_image_4_url,
  ].filter(Boolean) : [];

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <Link to="/group-materials">
          <Button variant="ghost" className="mb-4 -ml-3">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Groups
          </Button>
        </Link>
        <h1>Decision Guide</h1>
        <p className="text-muted-foreground mt-1">
          A guide for leaders helping students make decisions for Christ
        </p>
      </div>

      {/* Top info banner */}
      {guide?.baptism_class_info && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {guide.baptism_class_info}
          </p>
        </div>
      )}

      {/* Step 1 — Conversation */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">STEP 1</span>
              <h2 className="text-xl">Conversation</h2>
            </div>
            {guide?.step1_description && (
              <p className="text-muted-foreground">{guide.step1_description}</p>
            )}
            {guide?.baptism_guide_url && (
              <a
                href={guide.baptism_guide_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                Baptism Guide (PDF)
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Step 2 — Decision Form */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">STEP 2</span>
              <h2 className="text-xl">The Decision Form</h2>
            </div>
            {decisions.length > 0 && (
              <>
                <p className="text-muted-foreground mb-3 text-sm">
                  There are three decisions a student might be making that can be indicated on the form:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-sm mb-4 pl-2">
                  {decisions.map((d, i) => <li key={i}>{d}</li>)}
                </ol>
              </>
            )}
            {guide?.step2_warning && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  {guide.step2_warning}
                </p>
              </div>
            )}
            {guide?.step2_form_url && (
              <a
                href={guide.step2_form_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-semibold"
              >
                Open Decision Form
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Step 3 — Next Steps */}
      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <ArrowRight className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">STEP 3</span>
              <h2 className="text-xl">Next Steps</h2>
            </div>
            {guide?.step3_description && (
              <p className="text-muted-foreground mb-4">{guide.step3_description}</p>
            )}
            {nextStepImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {nextStepImages.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Next step ${i + 1}`}
                    className="w-full rounded-xl object-contain bg-muted"
                  />
                ))}
              </div>
            )}
            {guide?.thirty_three_things_url && (
              <a
                href={guide.thirty_three_things_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                33 Things Booklet (PDF)
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </Card>

      <div className="h-4" />
    </div>
  );
}
