'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function PaymentDialogComponent({ onPaymentComplete }: { onPaymentComplete: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState('credit-card')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate payment processing
    setTimeout(onPaymentComplete, 1000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
          Proceed to Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Pay $5 to unlock your full landscape design.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit-card" id="credit-card" />
              <Label htmlFor="credit-card">Credit Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal">PayPal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="amazon-pay" id="amazon-pay" />
              <Label htmlFor="amazon-pay">Amazon Pay</Label>
            </div>
          </RadioGroup>
          {paymentMethod === 'credit-card' && (
            <>
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="1234 5678 9012 3456" className="bg-gray-700 border-gray-600 text-gray-100" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" className="bg-gray-700 border-gray-600 text-gray-100" required />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" className="bg-gray-700 border-gray-600 text-gray-100" required />
                </div>
              </div>
            </>
          )}
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            Pay $5
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}