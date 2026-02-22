import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Shield, Bell as BellIcon, Palette } from "lucide-react";

const Settings = () => {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your workspace preferences" />

      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-0">
            {/* Company Info */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Company Information</h3>
                  <p className="text-xs text-muted-foreground">Basic details about your organization</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Company Name</Label>
                  <Input defaultValue="Webflora Technologies" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Website</Label>
                  <Input defaultValue="https://webflora.in" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input defaultValue="contact@webflora.in" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input defaultValue="+91 98765 43210" className="h-9" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input defaultValue="123 Tech Park, Bengaluru, Karnataka 560001" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GST Number</Label>
                  <Input defaultValue="29ABCDE1234F1Z5" className="h-9 font-mono" />
                </div>
              </div>
              <div className="pt-2">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
                  <p className="text-xs text-muted-foreground">Customize the look and feel</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Use smaller spacing in tables and lists</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Show Animations</p>
                    <p className="text-xs text-muted-foreground">Enable page transition animations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-0">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BellIcon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
                  <p className="text-xs text-muted-foreground">Choose what notifications you receive</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Invoice Reminders</p>
                    <p className="text-xs text-muted-foreground">Get notified about due invoices</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Project Deadlines</p>
                    <p className="text-xs text-muted-foreground">Alerts for upcoming deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment Received</p>
                    <p className="text-xs text-muted-foreground">Notification when payments are collected</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Employee Updates</p>
                    <p className="text-xs text-muted-foreground">Leave requests, attendance alerts</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-0">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Security Settings</h3>
                  <p className="text-xs text-muted-foreground">Manage access and permissions</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Session Timeout</p>
                    <p className="text-xs text-muted-foreground">Auto-logout after 30 mins of inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roles & Permissions</h4>
                <div className="space-y-2">
                  {["Admin", "Manager", "Employee", "Viewer"].map((role) => (
                    <div key={role} className="flex items-center justify-between py-2 px-3 bg-secondary rounded-lg">
                      <span className="text-sm font-medium text-foreground">{role}</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
