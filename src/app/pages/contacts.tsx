import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Mail, Phone, Clock, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Contact {
  id: number;
  sort_order: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  available: string;
}

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.from('contacts').select('*').order('sort_order').then(({ data }) => {
      setContacts(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Contact Information</h1>
        <p className="text-muted-foreground mt-1">Get in touch with camp staff and coordinators</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <Card key={contact.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                  <h3>{contact.name}</h3>
                </div>
              </div>

              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.available && (
                  <div className="flex items-center gap-3 text-sm pt-2 border-t">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{contact.available}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {contacts.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-2 text-center py-8">No contacts available.</p>
          )}
        </div>
      )}
    </div>
  );
}
