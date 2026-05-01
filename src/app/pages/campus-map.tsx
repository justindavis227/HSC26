import { Card } from '../components/ui/card';

export function CampusMapPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Campus Map</h1>
        <p className="text-muted-foreground mt-1">Interactive map of IU Bloomington campus</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="w-full" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
          <iframe
            src="https://map.concept3d.com/?id=951#!ct/16646,17145,27935?s/?mc/39.17327183613688,-86.50675219605847?z/14.387746442553665?lvl/0"
            width="100%"
            height="100%"
            title="IU Bloomington Campus Map"
            scrolling="no"
            allow="geolocation; gyroscope; accelerometer"
            style={{ border: '0px solid #fff', margin: 0, padding: 0 }}
          />
        </div>
      </Card>
    </div>
  );
}
