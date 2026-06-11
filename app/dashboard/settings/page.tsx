import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const notifications = [
  { label: "Client approval reminders", value: "Enabled" },
  { label: "New feedback alerts", value: "Enabled" },
  { label: "File upload notifications", value: "Enabled" },
  { label: "Weekly client summary", value: "Disabled" },
]

export default function SettingsPage() {
  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="rounded-full bg-white">
            Settings
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Workspace settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage agency profile, portal branding, notifications, and plan settings.
          </p>
        </div>

        <Button className="rounded-full">Save changes</Button>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Agency profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your agency details shown across portals and communications.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agency-name">Agency name</Label>
                  <Input
                    id="agency-name"
                    defaultValue="ClientFlow Agency"
                    className="rounded-xl bg-[#f7f7f5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    defaultValue="https://clientflow.co"
                    className="rounded-xl bg-[#f7f7f5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact email</Label>
                  <Input
                    id="email"
                    defaultValue="hello@clientflow.co"
                    className="rounded-xl bg-[#f7f7f5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="UTC">
                    <SelectTrigger id="timezone" className="w-full rounded-xl bg-[#f7f7f5]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="Africa/Algiers">Africa/Algiers</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="mt-5 rounded-full">Update profile</Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Portal branding</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Customise the look and feel of client portals.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="portal-name">Portal name</Label>
                  <Input
                    id="portal-name"
                    defaultValue="ClientFlow Portal"
                    className="rounded-xl bg-[#f7f7f5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary color</Label>
                  <Input
                    id="primary-color"
                    defaultValue="Black"
                    className="rounded-xl bg-[#f7f7f5]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="support-email">Support email</Label>
                  <Input
                    id="support-email"
                    defaultValue="support@clientflow.co"
                    className="rounded-xl bg-[#f7f7f5]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="welcome-message">Welcome message</Label>
                  <Textarea
                    id="welcome-message"
                    defaultValue="Welcome to your client portal. Review project progress, files, feedback, and approvals in one place."
                    className="min-h-24 rounded-2xl bg-[#f7f7f5]"
                  />
                </div>
              </div>

              <Button className="mt-5 rounded-full">Save branding</Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Control which alerts are sent to your team.
              </p>

              <div className="mt-5 space-y-3">
                {notifications.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-[#f4f4f2] px-4 py-3"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${
                        item.value === "Enabled"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-black/15 bg-white text-muted-foreground"
                      }`}
                    >
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Current plan</h2>

              <div className="mt-4">
                <p className="text-2xl font-semibold">Pro</p>
                <p className="text-sm text-muted-foreground">$49 / month</p>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-black" />
                  <span>Unlimited clients</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-black" />
                  <span>Unlimited projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-black" />
                  <span>Approval workflow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-black" />
                  <span>Client portal links</span>
                </div>
              </div>

              <Button className="mt-5 w-full rounded-full">Manage plan</Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Workspace health</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Overview of your workspace usage.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#f4f4f2] px-4 py-3 text-sm">
                  <span className="font-medium">Clients</span>
                  <span className="text-muted-foreground">24</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f4f4f2] px-4 py-3 text-sm">
                  <span className="font-medium">Projects</span>
                  <span className="text-muted-foreground">38</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f4f4f2] px-4 py-3 text-sm">
                  <span className="font-medium">Files</span>
                  <span className="text-muted-foreground">126</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#f4f4f2] px-4 py-3 text-sm">
                  <span className="font-medium">Pending approvals</span>
                  <span className="text-muted-foreground">7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-black/15 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold">Danger zone</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Export workspace data or permanently delete workspace.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Button variant="outline" className="w-full rounded-full bg-white">
                  Export data
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-rose-300 bg-white text-rose-600 hover:bg-rose-50"
                >
                  Delete workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
