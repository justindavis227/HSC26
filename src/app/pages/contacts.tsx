import { campData } from '../data/camp-data';
import { Card } from '../components/ui/card';
import { Mail, Phone, Clock, User } from 'lucide-react';

export function ContactsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Contact Information</h1>
        <p className="text-muted-foreground mt-1">Get in touch with camp staff and coordinators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campData.contacts.map((contact) => (
          <Card key={contact.email} className="p-6">
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
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm pt-2 border-t">
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{contact.available}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="mb-2">Emergency Contact</h3>
        <p className="text-sm text-muted-foreground mb-3">
          For urgent matters or emergencies outside of regular hours, please contact our 24/7 emergency line.
        </p>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary" />
          <a href="tel:(555) 123-4569" className="text-lg text-primary hover:underline">
            (555) 123-4569
          </a>
        </div>
      </Card>
    </div>
  );
}
