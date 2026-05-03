import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router';
import { ArrowLeft, MessageCircle, FileText, ArrowRight, ExternalLink, Download, Image } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../../lib/supabase';

interface DGItem { id: number; sort_order: number; title: string; file_url: string; file_name: string; }

function isPdf(name: string) { return (name ?? '').toLowerCase().endsWith('.pdf'); }

const nextStepsOptions = [
  { title: '33 Things Study',         description: 'A study to take new believers through after they decide to follow Jesus!' },
  { title: 'Find a Way to Serve',     description: 'An opportunity to begin serving and developing a lifestyle of being a Kingdom Worker!' },
  { title: 'Lead in MSM / SE!KIDS',   description: 'A step in beginning to make disciples of those a little further behind you!' },
  { title: 'Lead in HSM This Fall!',  description: 'Continue the relationships you formed at camp and keeping journeying together!' },
];

export function DecisionGuidePage() {
  const [resources, setResources] = useState<DGItem[]>([]);

  useEffect(() => {
    supabase.from('decision_guide').select('id,sort_order,title,file_url,file_name').order('sort_order')
      .then(({ data }) => setResources(data ?? []));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link to="/group-materials">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </Link>
        <h1>Decision Guide</h1>
        <p className="text-muted-foreground mt-1">
          A guide for leaders to help students as they make decisions for Christ
        </p>
      </div>

      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">STEP 1</span>
              <h2 className="text-xl">Conversation</h2>
            </div>
            <p className="text-muted-foreground">
              First thing you do when a student wants to make a decision for Christ is to have a gospel conversation.
              This guide can help you walk through the Bridge Illustration, help them consider where they are at with Christ.
            </p>
          </div>
        </div>
        <div className="mt-4 pl-16">
          <a href="/Baptism_Guide.pdf" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
            <FileText className="w-4 h-4" />
            Baptism Guide (PDF)
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">STEP 2</span>
              <h2 className="text-xl">The Decision Form</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              There are three decisions that a student might be making that can be indicated on our form:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm mb-4 pl-4">
              <li>To get baptized</li>
              <li>Re-commitment to Jesus</li>
              <li>Go into full time ministry</li>
            </ol>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
              <p className="text-sm">
                <strong className="text-yellow-900 dark:text-yellow-100">Important:</strong>{' '}
                <span className="text-yellow-800 dark:text-yellow-200">
                  Parents of minors must be contacted for all baptism decisions.
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 pl-16">
          <a href="https://my.southeastchristian.org/decided" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Decision Form
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">STEP 3</span>
              <h2 className="text-xl">Next Steps</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Please work with your <strong>STAFF / TEAM LEADER</strong> about student decisions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {nextStepsOptions.map((option, index) => (
                <Card key={index} className="p-4 bg-primary/5">
                  <h4 className="font-semibold mb-1">{option.title}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5">
        <h3 className="text-lg mb-2">33 Things Booklet</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Could be a great next step to get them engaged with the implications of our salvation! Great for new, growing, or stalled out believers.
        </p>
        <a href="https://resv2.craft.do/user/full/62f38b26-fcea-9762-55e6-2a72319dad67/doc/6C625550-61F1-4D71-ACD2-0E5EBD392B47/2654eedc-f580-304f-8b7d-d858c51b9c92"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
          <FileText className="w-4 h-4" />
          33 Things Booklet (PDF)
          <ExternalLink className="w-3 h-3" />
        </a>
      </Card>

      {/* Admin-uploaded resources */}
      {resources.length > 0 && (
        <div>
          <h2 className="text-xl mb-4">Resources</h2>
          <div className="space-y-3">
            {resources.map(item => (
              <Card key={item.id} className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPdf(item.file_name) ? 'bg-red-50 dark:bg-red-950' : 'bg-blue-50 dark:bg-blue-950'}`}>
                  {isPdf(item.file_name)
                    ? <FileText className="w-5 h-5 text-red-500" />
                    : <Image className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.file_name}</p>
                </div>
                {isPdf(item.file_name) ? (
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition shrink-0">
                    <Download className="w-4 h-4" />View
                  </a>
                ) : (
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition shrink-0">
                    View ↗
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
