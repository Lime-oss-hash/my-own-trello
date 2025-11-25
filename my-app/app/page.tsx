/**
 * SECTION: Client Component Configuration
 * FUNCTION: Enable client-side rendering for this page component.
 * INCLUDED: "use client" directive required for hooks, authentication, and interactivity.
 */
"use client";

/**
 * SECTION: Imports
 * FUNCTION: Import all necessary dependencies for the home page.
 * INCLUDED: Next.js components, UI components, authentication, routing, React hooks, and Lucide icons.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import { useUser, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Trello,
  Zap,
  Users,
  Lock,
  Palette,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Rocket,
  Target,
} from "lucide-react";

/**
 * SECTION: HomePage Component
 * FUNCTION: Main landing page component for the Trello Clone application.
 * INCLUDED: Hero section, features showcase, benefits, pricing teaser, CTA sections, and footer.
 */
export default function HomePage() {
  /**
   * SECTION: Hooks & State
   * FUNCTION: Initialize authentication and routing hooks.
   * INCLUDED: Clerk user authentication (isSignedIn), Next.js router for navigation.
   */
  const { isSignedIn } = useUser();
  const router = useRouter();

  /**
   * SECTION: Auto-redirect Logic
   * FUNCTION: Automatically redirect authenticated users to their dashboard.
   * INCLUDED: useEffect hook that monitors authentication state and redirects when user is signed in.
   */
  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  /**
   * SECTION: Features Data
   * FUNCTION: Define the six main features to showcase on the home page.
   * INCLUDED: Icon component, title, description, and color theme for each feature.
   */
  const features = [
    {
      icon: Trello,
      title: "Drag & Drop Tasks",
      description:
        "Effortlessly organize your work with intuitive drag-and-drop functionality across boards and columns.",
      color: "blue",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "See changes instantly as your team collaborates. Stay synchronized without refreshing.",
      color: "yellow",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Work together seamlessly with your team. Share boards and manage projects collectively.",
      color: "green",
    },
    {
      icon: Palette,
      title: "Customizable Boards",
      description:
        "Personalize your workspace with custom colors, labels, and board configurations.",
      color: "purple",
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description:
        "Your data is protected with enterprise-grade security and authentication.",
      color: "red",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description:
        "Monitor your projects with built-in analytics and progress tracking features.",
      color: "orange",
    },
  ];

  /**
   * SECTION: Benefits Data
   * FUNCTION: Define the three key benefits/value propositions.
   * INCLUDED: Icon component, title, and description for each benefit.
   */
  const benefits = [
    {
      icon: Target,
      title: "Stay Focused",
      description:
        "Clear visual organization helps you prioritize what matters most.",
    },
    {
      icon: Rocket,
      title: "Move Faster",
      description:
        "Streamlined workflows mean you spend less time managing and more time doing.",
    },
    {
      icon: Sparkles,
      title: "Work Smarter",
      description:
        "Powerful features that adapt to your workflow, not the other way around.",
    },
  ];

  /**
   * SECTION: Helper Function
   * FUNCTION: Map color names to Tailwind CSS class names for feature cards.
   * INCLUDED: Returns background, text, and icon color classes for six different colors.
   */
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", icon: "text-blue-600" },
      yellow: {
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        icon: "text-yellow-600",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        icon: "text-green-600",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        icon: "text-purple-600",
      },
      red: { bg: "bg-red-100", text: "text-red-600", icon: "text-red-600" },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        icon: "text-orange-600",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/**
       * SECTION: Hero Section
       * FUNCTION: Main landing area with headline, subheadline, CTA buttons, and visual preview.
       * INCLUDED: Badge, gradient headline, description, context-aware CTAs, and board mockup.
       */}
      <section className="container mx-auto px-4 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 px-4 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
            <Sparkles className="h-3 w-3 mr-2 inline" />
            Modern Task Management
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
            Organize Your Work,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Amplify Your Productivity
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in-up">
            The visual workspace where teams plan, organize, and collaborate on
            any project. Simple, flexible, and powerful.
          </p>

          {/**
           * SUBSECTION: Call-to-Action Buttons
           * FUNCTION: Display context-aware buttons based on authentication state.
           * INCLUDED: "Go to Dashboard" for signed-in users, "Get Started" + "View Pricing" for guests.
           */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="text-base sm:text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="text-base sm:text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base sm:text-lg px-8 py-6 border-2"
                  >
                    View Pricing
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/**
           * SUBSECTION: Hero Visual - Board Preview Mockup
           * FUNCTION: Show a visual representation of the board interface.
           * INCLUDED: Three colored columns (blue, purple, green) with placeholder task cards.
           */}
          <div className="relative max-w-5xl mx-auto mt-16 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
            <Card className="relative border-2 border-gray-200 shadow-2xl overflow-hidden">
              <CardContent className="p-8 sm:p-12 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/**
                   * COLUMN: Todo Column (Blue)
                   * Simulated board column with 2 task cards
                   */}
                  <div className="space-y-3">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <div className="h-2 bg-blue-600 rounded w-20 mb-2"></div>
                      <div className="space-y-2">
                        <div className="bg-white rounded p-2 shadow-sm">
                          <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="bg-white rounded p-2 shadow-sm">
                          <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <div className="h-2 bg-purple-600 rounded w-24 mb-2"></div>
                      <div className="space-y-2">
                        <div className="bg-white rounded p-2 shadow-sm">
                          <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-100 rounded-lg p-3">
                      <div className="h-2 bg-green-600 rounded w-16 mb-2"></div>
                      <div className="space-y-2">
                        <div className="bg-white rounded p-2 shadow-sm">
                          <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="bg-white rounded p-2 shadow-sm">
                          <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="bg-white rounded p-2 shadow-sm">
                          <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/**
       * SECTION: Features Section
       * FUNCTION: Showcase the six main features of the application.
       * INCLUDED: Section header, feature grid with cards, icons, titles, and descriptions.
       */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-4 px-4 py-2 bg-purple-100 text-purple-700 border-purple-200">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you and your team work more
            efficiently.
          </p>
        </div>

        {/**
         * SUBSECTION: Features Grid
         * FUNCTION: Render all six features in a responsive grid layout.
         * INCLUDED: Colorful icon boxes, titles, descriptions, and hover animations.
         */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = getColorClasses(feature.color);
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-200"
              >
                <CardContent className="p-6 sm:p-8">
                  <div
                    className={`h-12 w-12 sm:h-14 sm:w-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${colors.icon}`} />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl mb-3 text-gray-900">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/**
       * SECTION: Benefits Section
       * FUNCTION: Highlight why teams should choose this platform with gradient background.
       * INCLUDED: Three benefits, platform statistics (users, tasks, uptime, support).
       */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Why Teams Love Our Platform
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of teams who have transformed their workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-blue-100 text-base sm:text-lg">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/**
           * SUBSECTION: Statistics Grid
           * FUNCTION: Display platform metrics to build trust and social proof.
           * INCLUDED: Active users, tasks completed, uptime percentage, support availability.
           */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            {[
              { value: "100K+", label: "Active Users" },
              { value: "1M+", label: "Tasks Completed" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-blue-100 text-sm sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/**
       * SECTION: Pricing Teaser
       * FUNCTION: Display three pricing tiers to encourage upgrades.
       * INCLUDED: Free, Pro (most popular), and Enterprise plans with features and pricing.
       */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 bg-green-100 text-green-700 border-green-200">
            Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/**
         * SUBSECTION: Pricing Cards Grid
         * FUNCTION: Display three pricing tiers in card format.
         * INCLUDED: Free plan, Pro plan (highlighted), and Enterprise plan.
         */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:shadow-xl transition-all">
            <CardContent className="p-6 sm:p-8">
              <CardTitle className="text-2xl mb-2">Free</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">1 Board</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Unlimited Tasks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Basic Features</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan - Most Popular (Highlighted with blue border) */}
          <Card className="border-2 border-blue-600 hover:shadow-xl transition-all relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardContent className="p-6 sm:p-8">
              <CardTitle className="text-2xl mb-2">Pro</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$4.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Unlimited Boards</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Advanced Features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Priority Support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all">
            <CardContent className="p-6 sm:p-8">
              <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$19.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Custom Integrations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Dedicated Support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-10">
          <Link href="/pricing">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 border-2"
            >
              View Full Pricing Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/**
       * SECTION: Final Call-to-Action
       * FUNCTION: Strong closing section encouraging users to sign up or go to dashboard.
       * INCLUDED: Compelling headline, description, and context-aware CTA button.
       */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
          <CardContent className="p-12 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of teams who have already revolutionized the way
              they work. Start free today, no credit card required.
            </p>
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="text-base sm:text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Go to Your Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="text-base sm:text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            )}
          </CardContent>
        </Card>
      </section>

      {/**
       * SECTION: Footer
       * FUNCTION: Site footer with branding, navigation links, and copyright.
       * INCLUDED: Logo, tagline, Product links, Company links, and copyright notice.
       */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Trello className="h-8 w-8 text-blue-500" />
                <span className="text-2xl font-bold">Trello Clone</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The modern visual workspace where teams plan, organize, and
                collaborate on any project.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} Trello Clone. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
