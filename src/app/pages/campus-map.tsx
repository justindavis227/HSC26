import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePageTitle } from '../hooks/use-page-title';

const DEFAULT_EMBED_URL =
  'https://map.concept3d.com/?id=951#!ct/16646,17145,27935?s/?mc/39.17327183613688,-86.50675219605847?z/14.387746442553665?lvl/0';

function isPdf(name: string) { return (name ?? '').toLowerCase().endsWith('.pdf'); }

export function CampusMapPage() {
  const [mode, setMode]       = useState<'embed' | 'file'>('embed');
  const [embedUrl, setEmbedUrl] = useState(DEFAULT_EMBED_URL);
  const [fileUrl, setFileUrl]   = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading]   = useState(true);
  const { title, subtitle } = usePageTitle('camp_map', {
    title: 'Campus Map',
    subtitle: 'Interactive map of IU Bloomington campus',
  });

  useEffect(() => {
    supabase
      .from('camp_info')
      .select('key,value')
      .in('key', ['camp_map_mode', 'camp_map_embed_url', 'camp_map_file_url', 'camp_map_file_name'])
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data ?? []).forEach(r => { map[r.key] = r.value; });
        if (map.camp_map_mode === 'file') setMode('file');
        if (map.camp_map_embed_url) setEmbedUrl(map.camp_map_embed_url);
        setFileUrl(map.camp_map_file_url ?? '');
        setFileName(map.camp_map_file_name ?? '');
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {loading ? (
        <Card className="p-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </Card>
      ) : mode === 'file' && fileUrl ? (
        <Card className="p-0 overflow-hidden">
          {isPdf(fileName) ? (
            <div className="p-8 flex flex-col items-center gap-4">
              <FileText className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{fileName || 'Campus Map PDF'}</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition">
                View / Download Map
              </a>
            </div>
          ) : (
            <img src={fileUrl} alt="Campus Map" className="w-full h-auto" />
          )}
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="w-full" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              title="Campus Map"
              scrolling="no"
              allow="geolocation; gyroscope; accelerometer"
              style={{ border: '0px solid #fff', margin: 0, padding: 0 }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
