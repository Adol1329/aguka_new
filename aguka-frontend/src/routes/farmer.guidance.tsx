import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  BookOpen, 
  Leaf, 
  Dog, 
  ChevronRight, 
  ExternalLink,
  Sprout,
  Milk,
  Bug,
  Droplets
} from "lucide-react";
import { useLivestockGuidance } from "@/hooks/use-livestock";

export const Route = createFileRoute("/farmer/guidance")({
  component: GuidancePage,
});

function GuidancePage() {
  const [livestockGuidance, setLivestockGuidance] = useState<{
    crops: any[];
    livestock: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize with static data then fetch real data
  useEffect(() => {
    // Set initial static data for immediate display
    setLivestockGuidance({
      crops: [
        {
          title: "Maize Planting Guide",
          description: "Best practices for spacing, fertilization, and weeding for high-yield maize.",
          icon: Sprout,
          category: "Planting",
          readTime: "5 min",
        },
        {
          title: "Pest Management in Beans",
          description: "How to identify and treat common pests in bean plantations organically.",
          icon: Bug,
          category: "Protection",
          readTime: "8 min",
        },
        {
          title: "Drip Irrigation Setup",
          description: "Step-by-step guide to installing and maintaining a drip irrigation system.",
          icon: Droplets,
          category: "Water",
          readTime: "12 min",
        },
        {
          title: "Post-Harvest Handling",
          description: "Reducing losses during storage and transport of grains.",
          icon: Leaf,
          category: "Harvest",
          readTime: "6 min",
        },
      ],
      livestock: [
        {
          title: "Dairy Cow Nutrition",
          description: "Balanced feed formulations for maximizing milk production.",
          icon: Milk,
          category: "Feeding",
          readTime: "10 min",
        },
        {
          title: "Poultry Disease Prevention",
          description: "Vaccination schedules and hygiene practices for healthy chickens.",
          icon: Bug,
          category: "Health",
          readTime: "7 min",
        },
        {
          title: "Pig Farming Basics",
          description: "A beginner guide to housing, breeding, and feeding pigs.",
          icon: Dog,
          category: "General",
          readTime: "15 min",
        },
      ]
    });
    
    // Fetch real guidance from API
    const fetchGuidance = async () => {
      try {
        // Try to get livestock-specific guidance
        const livestockData = await livestockApi.getGuidance({
          animalType: undefined,
          breed: undefined,
          age: undefined,
          healthStatus: undefined
        });
        
        // For now, we'll enhance our static data with any real data we get
        // In a full implementation, we would replace static data entirely
        console.log("Livestock guidance data:", livestockData.data);
      } catch (error) {
        console.warn("Could not fetch livestock guidance from API:", error);
        // Continue with static data
      }
    };
    
    fetchGuidance().finally(() => {
      setIsLoading(false);
    });
  }, []);
  
  // Use empty arrays if guidance is still loading
  const guides = livestockGuidance || {
    crops: [],
    livestock: []
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farming Guidance"
        subtitle="Expert advice and best practices for your crops and livestock."
      />

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search guides (e.g. 'Maize', 'Cattle')..." className="pl-9" />
        </div>
        <Button>Search</Button>
      </div>

      <Tabs defaultValue="crops" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="crops" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Crops
          </TabsTrigger>
          <TabsTrigger value="livestock" className="flex items-center gap-2">
            <Dog className="h-4 w-4" />
            Livestock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crops" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {guides.crops.length > 0 ? (
              guides.crops.map((guide) => (
                <Card key={guide.title} className="group hover:shadow-md transition-all cursor-pointer border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <guide.icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                        {guide.category}
                      </span>
                    </div>
                    <CardTitle className="mt-4">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {guide.readTime} read
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium">
                        Read Guide
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-4 text-muted-foreground/50" />
                <p>No crop guides available.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="livestock" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {guides.livestock.length > 0 ? (
              guides.livestock.map((guide) => (
                <Card key={guide.title} className="group hover:shadow-md transition-all cursor-pointer border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <guide.icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                        {guide.category}
                      </span>
                    </div>
                    <CardTitle className="mt-4">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {guide.readTime} read
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium">
                        Read Guide
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                <Dog className="h-8 w-8 mx-auto mb-4 text-muted-foreground/50" />
                <p>No livestock guides available.</p>
                <p className="text-sm">
                  Check back later for expert advice on animal husbandry, feeding, health, and breeding.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Need more information?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Our expert extension officers are available to provide personalized advice for your farm.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Visit RAB Portal
            </Button>
            <Button className="flex items-center gap-2">
              Contact Officer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}