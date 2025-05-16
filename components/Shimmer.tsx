import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div className={cn("animate-pulse bg-muted rounded", className)} />
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-[3/4] relative">
        <Shimmer className="w-full h-full rounded-lg" />
      </div>
      {/* Title skeleton */}
      <div className="mt-2 px-1">
        <Shimmer className="h-4 w-3/4 rounded mb-1" />
        <Shimmer className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function FeaturedSkeleton() {
  return (
    <div className="relative h-[70vh] w-full">
      <Shimmer className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/30 to-transparent">
          <div className="flex items-center h-full px-8 lg:px-16">
            <div className="flex items-center gap-8 max-w-7xl w-full">
              <div className="flex-shrink-0 hidden md:block">
                <Shimmer className="w-64 h-96 rounded-xl" />
              </div>
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shimmer className="h-6 w-20 rounded-full" />
                    <Shimmer className="h-6 w-16 rounded" />
                  </div>
                  <Shimmer className="h-12 w-3/4 rounded" />
                </div>
                <div className="space-y-2">
                  <Shimmer className="h-4 w-full rounded" />
                  <Shimmer className="h-4 w-5/6 rounded" />
                  <Shimmer className="h-4 w-4/6 rounded" />
                </div>
                <div className="flex gap-2">
                  <Shimmer className="h-6 w-16 rounded-full" />
                  <Shimmer className="h-6 w-20 rounded-full" />
                  <Shimmer className="h-6 w-18 rounded-full" />
                </div>
                <div className="flex gap-4 pt-4">
                  <Shimmer className="h-10 w-32 rounded" />
                  <Shimmer className="h-10 w-10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
