import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BarChart3Icon, ArrowRightIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  // Check if user is already authenticated
  const { data, error } = await supabase.auth.getClaims();
  
  if (!error && data?.claims) {
    // User is authenticated, redirect to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <BarChart3Icon className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Dashboard Hub
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A centralized platform for embedding and contextualizing dashboards from 
            Tableau, Salesforce, Power BI, and more. Add insights, notes, and collaborative 
            context around your business intelligence tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Get Started
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Dashboard Hub?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-blue-100 w-fit mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <CardTitle>Multi-Platform Support</CardTitle>
                <CardDescription>
                  Embed dashboards from Tableau, Salesforce, Power BI, and other BI tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Tableau Server & Cloud
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Salesforce Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Microsoft Power BI
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-yellow-100 w-fit mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <CardTitle>Contextual Insights</CardTitle>
                <CardDescription>
                  Add notes, explanations, and collaborative context around your dashboards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Rich text annotations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Collaborative notes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Visual callouts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 rounded-lg bg-green-100 w-fit mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Role-based access with company-wide dashboard organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    User role management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Dashboard sections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Team insights
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Perfect for Companies with Limited BI Licenses
          </h2>
          
          <div className="space-y-8">
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  Cost-Effective Dashboard Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share Tableau, Salesforce, or Power BI dashboards with your entire team 
                  without needing individual licenses for each platform. Embed dashboards 
                  and let everyone view and collaborate.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  Centralized Data Storytelling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create a single hub for all your business intelligence tools. Add context, 
                  explanations, and insights to help your team understand what the data means 
                  and how to act on it.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Cross-Platform Reporting Canvas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organize dashboards by topic (Weekly Ops, Quarterly Reviews, etc.) and 
                  create comprehensive reporting experiences that span multiple BI platforms.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Building Your Dashboard Hub
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}