import { useParams } from "wouter"
import { useGetCheckIn, useMarkActionComplete } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react"
import { Link } from "wouter"
import { motion } from "framer-motion"

export default function CheckInDetail() {
  const { id } = useParams<{ id: string }>()
  const checkInId = parseInt(id)
  
  const { data: checkIn, isLoading, refetch } = useGetCheckIn(checkInId)
  const markActionComplete = useMarkActionComplete()

  if (isLoading) {
    return <div className="p-6 md:p-10 max-w-2xl mx-auto animate-pulse">
      <div className="h-10 bg-card rounded w-1/4 mb-8"></div>
      <div className="h-64 bg-card rounded-2xl w-full"></div>
    </div>
  }

  if (!checkIn) {
    return <div className="p-10 text-center text-muted-foreground">Check-in not found</div>
  }

  const handleToggleAction = async () => {
    try {
      await markActionComplete.mutateAsync({
        id: checkInId,
        data: { actionCompleted: !checkIn.actionCompleted }
      })
      refetch()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 pb-24 md:pb-10"
    >
      <Link href="/check-in" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to check-ins
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Reflection</h1>
        <p className="text-muted-foreground">Week of {new Date(checkIn.weekOf).toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-card border-none">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Prompt</h3>
            <p className="text-lg text-foreground font-serif">{checkIn.prompt}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Response</h3>
            <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
              {checkIn.response || "No response recorded."}
            </p>
          </CardContent>
        </Card>

        {checkIn.analysisResult && (
          <Card className="bg-primary/5 border-none">
            <CardContent className="p-6 md:p-8 space-y-4">
              <h3 className="text-sm font-medium text-primary uppercase tracking-wider">Analysis</h3>
              <p className="text-lg text-foreground/90 font-serif leading-relaxed">
                {checkIn.analysisResult}
              </p>
            </CardContent>
          </Card>
        )}

        {checkIn.actionSuggested && (
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="p-6 flex items-start gap-4">
              <button 
                onClick={handleToggleAction}
                className="mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-accent rounded-full"
              >
                {checkIn.actionCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                ) : (
                  <Circle className="w-8 h-8 text-accent/50 hover:text-accent transition-colors" />
                )}
              </button>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-semibold text-foreground">Suggested Action</h3>
                <p className="text-muted-foreground text-lg">
                  {checkIn.actionSuggested}
                </p>
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className={checkIn.actionCompleted ? "border-accent text-accent bg-accent/10" : ""}
                    onClick={handleToggleAction}
                  >
                    {checkIn.actionCompleted ? "Marked Complete" : "Mark Complete"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  )
}
