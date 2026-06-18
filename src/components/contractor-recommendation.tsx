'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const contractors = [
  { id: 1, name: "Green Thumb Landscaping", rating: 4.8, specialties: ["Modern", "Sustainable"] },
  { id: 2, name: "Nature's Architects", rating: 4.7, specialties: ["Traditional", "Water Features"] },
  { id: 3, name: "Urban Oasis Creators", rating: 4.9, specialties: ["Small Spaces", "Vertical Gardens"] },
]

export function ContractorRecommendationComponent() {
  const [selectedContractor, setSelectedContractor] = useState<{ id: number; name: string; rating: number; specialties: string[] } | null>(null)

  const handleScheduleConsultation = (contractor: { id: number; name: string; rating: number; specialties: string[] }) => {
    setSelectedContractor(contractor)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-100 text-center">Recommended Contractors</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contractors.map((contractor) => (
          <Card key={contractor.id} className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-emerald-400">{contractor.name}</CardTitle>
              <CardDescription className="text-gray-300">Rating: {contractor.rating}/5</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-2">Specialties: {contractor.specialties.join(", ")}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => handleScheduleConsultation(contractor)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Schedule Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-gray-100">
                  <DialogHeader>
                    <DialogTitle>Schedule a Consultation</DialogTitle>
                    <DialogDescription>
                      {selectedContractor && `You're scheduling a consultation with ${selectedContractor.name}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <p>Consultation scheduling functionality would be implemented here.</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Confirm Scheduling
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}