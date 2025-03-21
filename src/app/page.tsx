import Link from "next/link"
import { ArrowRight, BookOpen, Users, Calendar, Award, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeatureCard from "@/components/feature-card"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4 mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LearnDaily</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium hover:text-primary">
              Log in
            </Link>
            <Link href="/auth/signup"><Button>Sign Up Free</Button></Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 ml-6 md:ml-14 lg:ml-20">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Learn Something New Every Day
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Discover, share, and grow with a community of curious minds. Expand your knowledge one day at a
                    time.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="gap-1">
                    Start Learning Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Explore Content
                  </Button>
                </div>
              </div>
             
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full border-t border-b bg-muted/40 py-12 md:py-16">
          <div className="container grid gap-4 px-4 md:px-6 md:grid-cols-3 m-auto">
            <div className="flex flex-col items-center justify-center space-y-2 border-b border-muted pb-4 md:border-r md:border-b-0 md:pb-0">
              <h2 className="text-3xl font-bold">10k+</h2>
              <p className="text-center text-sm text-muted-foreground">Daily Active Learners</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border-b border-muted pb-4 md:border-r md:border-b-0 md:pb-0">
              <h2 className="text-3xl font-bold">50k+</h2>
              <p className="text-center text-sm text-muted-foreground">Knowledge Pieces Shared</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <h2 className="text-3xl font-bold">95%</h2>
              <p className="text-center text-sm text-muted-foreground">User Satisfaction</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 m-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need to expand your knowledge
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Our platform is designed to make learning a daily habit with features that keep you engaged and
                  motivated.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Calendar className="h-10 w-10 text-primary" />}
                title="Daily Bite-sized Learning"
                description="Receive curated knowledge pieces that take just 5 minutes to consume each day."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Community Sharing"
                description="Connect with like-minded learners and share your own knowledge and insights."
              />
              <FeatureCard
                icon={<Award className="h-10 w-10 text-primary" />}
                title="Personalized Experience"
                description="Content tailored to your interests and learning goals for maximum engagement."
              />
              <FeatureCard
                icon={<BookOpen className="h-10 w-10 text-primary" />}
                title="Diverse Topics"
                description="Explore a wide range of subjects from science to arts, technology to philosophy."
              />
              <FeatureCard
                icon={<ArrowRight className="h-10 w-10 text-primary" />}
                title="Progress Tracking"
                description="Monitor your learning journey with intuitive dashboards and statistics."
              />
              <FeatureCard
                icon={<ChevronRight className="h-10 w-10 text-primary" />}
                title="Learning Paths"
                description="Follow structured paths to master specific subjects or skills systematically."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full bg-muted/40 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 m-auto ">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">How It Works</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Simple steps to daily learning
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Getting started is easy. Begin your learning journey in just a few simple steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-bold">Sign Up</h3>
                <p className="text-muted-foreground">
                  Create your free account and tell us about your interests and learning goals.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="text-xl font-bold">Receive Daily Content</h3>
                <p className="text-muted-foreground">
                  Get personalized knowledge pieces delivered to you every day based on your preferences.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-bold">Learn & Share</h3>
                <p className="text-muted-foreground">
                  Consume your daily learning, track your progress, and share insights with the community.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="w-full bg-primary py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 m-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-primary-foreground">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight lg:text-5xl">
                  Ready to start your learning journey?
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed">
                  Join thousands of curious minds expanding their knowledge every day.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" className="gap-1">
                  Sign Up Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row m-auto">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold">LearnDaily</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 LearnDaily. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

