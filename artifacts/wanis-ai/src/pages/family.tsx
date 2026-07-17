import { useState } from "react"
import { 
  useListFamilyMembers, 
  useCreateFamilyMember, 
  useDeleteFamilyMember 
} from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Heart, Phone, Plus, Shield, Trash2, User } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

export default function Family() {
  const { data: familyMembers, isLoading, refetch } = useListFamilyMembers()
  const createFamilyMember = useCreateFamilyMember()
  const deleteFamilyMember = useDeleteFamilyMember()
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    photoUrl: "",
    isEmergencyContact: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createFamilyMember.mutateAsync({
        data: {
          ...formData,
          isEmergencyContact: formData.isEmergencyContact || false
        }
      })
      setIsAddOpen(false)
      setFormData({ name: "", relationship: "", phone: "", photoUrl: "", isEmergencyContact: false })
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Remove this family member?")) {
      try {
        await deleteFamilyMember.mutateAsync({ id })
        refetch()
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 pb-24 md:pb-10"
    >
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Family Circle
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            The people who matter most.
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="hidden md:flex gap-2">
              <Plus className="w-5 h-5" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-none rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Add Family Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Sarah"
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input 
                  required
                  value={formData.relationship}
                  onChange={e => setFormData({...formData, relationship: e.target.value})}
                  placeholder="e.g. Daughter"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="e.g. +1 555 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Photo URL (Optional)</Label>
                <Input 
                  value={formData.photoUrl}
                  onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                <div className="space-y-0.5">
                  <Label>Emergency Contact</Label>
                  <p className="text-sm text-muted-foreground">They can be reached quickly if needed</p>
                </div>
                <Switch 
                  checked={formData.isEmergencyContact}
                  onCheckedChange={c => setFormData({...formData, isEmergencyContact: c})}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg mt-4" disabled={createFamilyMember.isPending}>
                Save Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-card rounded-2xl" />)}
        </div>
      ) : familyMembers && familyMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.map((member) => (
            <Card key={member.id} className="bg-white border-none shadow-sm overflow-hidden group">
              <div className="h-32 bg-secondary/50 relative">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/20">
                    <User className="w-16 h-16" />
                  </div>
                )}
                {member.isEmergencyContact && (
                  <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                    <Shield className="w-3 h-3" /> Emergency
                  </div>
                )}
              </div>
              <CardContent className="p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-foreground">{member.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Heart className="w-4 h-4 text-primary" /> {member.relationship}
                    </p>
                  </div>
                </div>
                
                {member.phone && (
                  <div className="flex items-center gap-2 text-foreground/80 mt-4 bg-card p-3 rounded-xl">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{member.phone}</span>
                  </div>
                )}
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-dashed border-2 p-12 text-center flex flex-col items-center justify-center">
          <User className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-serif text-foreground mb-2">Your family circle is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Add family members so we know who is important to you. They'll appear here for easy access.
          </p>
          <Button onClick={() => setIsAddOpen(true)} size="lg">
            Add First Member
          </Button>
        </Card>
      )}

      {/* Mobile fab */}
      <div className="md:hidden fixed bottom-[100px] right-6 z-50">
        <Button 
          size="icon" 
          className="w-14 h-14 rounded-full shadow-lg"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  )
}
