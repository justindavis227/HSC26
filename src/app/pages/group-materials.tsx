import { campData } from '../data/camp-data';
import { Card } from '../components/ui/card';
import { FolderOpen, CheckCircle, Info, ArrowRight, Users, ClipboardList, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

export function GroupMaterialsPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1>Group Materials</h1>
        <p className="text-muted-foreground mt-1">Resources to Support Leaders and Groups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="https://my.southeastchristian.org/page/1367"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg mb-1">Student Roster</h3>
                  <p className="text-sm text-muted-foreground">View your group's student list</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </a>

        <a
          href="https://my.southeastchristian.org/groupapp"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg mb-1">Group Tracker</h3>
                  <p className="text-sm text-muted-foreground">Track attendance and activities</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </a>
      </div>

      {campData.groupMaterials.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campData.groupMaterials.map((group) => (
            <Card key={group.group} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
                <h3>{group.group}</h3>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm mb-2">Materials Provided:</h4>
                <ul className="space-y-2">
                  {group.materials.map((material) => (
                    <li key={material} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
                {group.notes && (
                  <div className="pt-3 border-t">
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{group.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Link to="/decision-guide">
        <Card className="p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg mb-1">Decision Guide</h3>
              <p className="text-sm text-muted-foreground">
                A guide for leaders to help students as they make decisions for Christ
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </Link>
    </div>
  );
}
