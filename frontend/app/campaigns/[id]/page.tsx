"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Campaign, Donation } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  formatDate,
  getProgressPercentage,
  resolveImageUrl,
} from "@/lib/utils";
import {
  Loader2,
  Target,
  Calendar as CalendarIcon,
  Flag,
  Edit,
  Trash2,
  CreditCard,
  TriangleAlert,
} from "lucide-react";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Donation state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [donateError, setDonateError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [donationForm, setDonationForm] = useState({
    amount: "",
    message: "",
    cardNumber: "4242 4242 4242 4242",
    cardHolder: "",
    expiryDate: "12/26",
    cvv: "123",
  });

  const emailVerified = Boolean(user?.emailVerified || user?.emailVerifiedAt);

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignRes, donationsRes] = await Promise.all([
          api.get(`/campaigns/${id}`),
          api.get(`/donations/campaign/${id}`),
        ]);
        setCampaign(campaignRes.data);
        setDonations(donationsRes.data.data);
      } catch {
        router.push("/campaigns");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleDonate = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!emailVerified) {
      setDonateError("Please verify your email before donating.");
      router.push("/profile");
      return;
    }

    setDonating(true);
    setDonateError("");
    try {
      await api.post(`/donations/campaign/${id}`, {
        amount: parseFloat(donationForm.amount),
        message: donationForm.message,
        cardNumber: donationForm.cardNumber,
        cardHolder: donationForm.cardHolder || user.name,
        expiryDate: donationForm.expiryDate,
        cvv: donationForm.cvv,
      });
      setDonateSuccess(true);
      // Refresh campaign
      const res = await api.get(`/campaigns/${id}`);
      setCampaign(res.data);
      // Refresh donations
      const dRes = await api.get(`/donations/campaign/${id}`);
      setDonations(dRes.data.data);
    } catch (err: any) {
      setDonateError(err.response?.data?.message || "Donation failed");
    } finally {
      setDonating(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReportLoading(true);
    try {
      await api.post(`/campaigns/${id}/report`, { reason: reportReason });
      setShowReportModal(false);
      alert("Campaign reported successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to report campaign");
    } finally {
      setReportLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/campaigns/${id}`);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete campaign");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-64 bg-neutral-100 rounded-lg animate-pulse mb-6" />
        <div className="h-8 bg-neutral-100 rounded animate-pulse mb-4 w-3/4" />
        <div className="h-4 bg-neutral-100 rounded animate-pulse mb-2 w-full" />
      </div>
    );
  }

  if (!campaign) return null;

  const progress = getProgressPercentage(
    campaign.raisedAmount,
    campaign.goalAmount,
  );
  const isOwner = user?.id === campaign.creatorId;
  const isAdmin = user?.role === "admin";
  const canDonate = Boolean(
    user && emailVerified && !isOwner && campaign.status === "active",
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cover Image */}
      {campaign.coverImage && (
        <div className="h-72 md:h-96 rounded-xl overflow-hidden mb-8">
          <img
            src={resolveImageUrl(campaign.coverImage)}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              {campaign.category && (
                <span className="text-xs uppercase tracking-wide text-neutral-500 font-medium">
                  {campaign.category}
                </span>
              )}
              <h1 className="text-3xl font-bold mt-1">{campaign.title}</h1>
              <p className="text-neutral-500 text-sm mt-1">
                by{" "}
                {campaign.creatorId ? (
                  <Link
                    href={`/users/${campaign.creatorId}`}
                    className="hover:text-neutral-900 hover:underline"
                  >
                    {campaign.creator?.name || "Unknown"}
                  </Link>
                ) : (
                  campaign.creator?.name || "Unknown"
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {campaign.status === "frozen" && (
                <Badge variant="warning">Frozen</Badge>
              )}
              {campaign.reported && isAdmin && (
                <Badge variant="destructive">Reported</Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(isOwner || isAdmin) && (
              <Link href={`/campaigns/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit size={14} className="mr-1.5" /> Edit
                </Button>
              </Link>
            )}
            {(isOwner || isAdmin) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={14} className="mr-1.5" /> Delete
              </Button>
            )}
            {user && !isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReportModal(true)}
              >
                <Flag size={14} className="mr-1.5" /> Report
              </Button>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {campaign.description}
            </p>
          </div>

          {/* Donations list */}
          {donations.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
              <div className="space-y-3">
                {donations.slice(0, 10).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between py-3 border-b border-neutral-100"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {donation.donor?.name}
                      </p>
                      {donation.message && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          &ldquo;{donation.message}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(donation.amount)}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(campaign.raisedAmount)}
              </div>
              <div className="text-sm text-neutral-500 mb-3">
                raised of {formatCurrency(campaign.goalAmount)} goal
              </div>

              <Progress value={progress} className="mb-2" />
              <div className="text-sm font-medium mb-6">{progress}% funded</div>

              {campaign.deadline && (
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                  <CalendarIcon size={14} />
                  <span>Ends {formatDate(campaign.deadline)}</span>
                </div>
              )}

              {canDonate && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowDonateModal(true)}
                >
                  <CreditCard size={16} className="mr-2" /> Donate Now
                </Button>
              )}

              {user && !emailVerified && (
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    <TriangleAlert size={16} className="mr-2" />
                    Verify email to donate
                  </Button>
                </Link>
              )}

              {!user && (
                <Link href="/login">
                  <Button className="w-full" size="lg">
                    Sign in to Donate
                  </Button>
                </Link>
              )}

              {isOwner && (
                <p className="text-center text-sm text-neutral-500">
                  This is your campaign
                </p>
              )}

              {campaign.status === "frozen" && (
                <p className="text-center text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded">
                  This campaign is currently frozen
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Donate Modal */}
      <Dialog open={showDonateModal} onOpenChange={setShowDonateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Donation</DialogTitle>
            <DialogDescription>
              Support &ldquo;{campaign.title}&rdquo;
            </DialogDescription>
          </DialogHeader>

          {donateSuccess ? (
            <div className="py-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-600">Thank you!</h3>
              <p className="text-neutral-500 mt-1">
                Your donation was successful.
              </p>
              <Button
                className="mt-4 w-full"
                onClick={() => {
                  setShowDonateModal(false);
                  setDonateSuccess(false);
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {donateError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {donateError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Donation Amount</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="25"
                  value={donationForm.amount}
                  onChange={(e) => {
                    setPreviewLoading(true);
                    setDonationForm((f) => ({ ...f, amount: e.target.value }));
                    window.setTimeout(() => setPreviewLoading(false), 150);
                  }}
                />
              </div>

              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() =>
                      setDonationForm((f) => ({ ...f, amount: String(amt) }))
                    }
                    className={`flex-1 py-1.5 text-sm border rounded-md transition-colors ${donationForm.amount === String(amt) ? "bg-black text-white border-black" : "border-neutral-200 hover:border-black"}`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Message (optional)</Label>
                <Textarea
                  placeholder="Write an encouraging message..."
                  value={donationForm.message}
                  onChange={(e) =>
                    setDonationForm((f) => ({ ...f, message: e.target.value }))
                  }
                  className="min-h-[60px]"
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-neutral-500 mb-3 flex items-center gap-1">
                  <CreditCard size={12} /> Mock payment — no real charges
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Card Number</Label>
                    <Input
                      placeholder="4242 4242 4242 4242"
                      value={donationForm.cardNumber}
                      onChange={(e) =>
                        setDonationForm((f) => ({
                          ...f,
                          cardNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Expiry</Label>
                      <Input
                        placeholder="MM/YY"
                        value={donationForm.expiryDate}
                        onChange={(e) =>
                          setDonationForm((f) => ({
                            ...f,
                            expiryDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>CVV</Label>
                      <Input
                        placeholder="123"
                        value={donationForm.cvv}
                        onChange={(e) =>
                          setDonationForm((f) => ({
                            ...f,
                            cvv: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDonateModal(false)}
                  disabled={donating || previewLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDonate}
                  loading={donating}
                  disabled={
                    previewLoading ||
                    !donationForm.amount ||
                    parseFloat(donationForm.amount) <= 0
                  }
                >
                  {donating ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </span>
                  ) : previewLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Preparing...
                    </span>
                  ) : (
                    <>
                      Donate{" "}
                      {donationForm.amount
                        ? formatCurrency(parseFloat(donationForm.amount))
                        : ""}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Campaign</DialogTitle>
            <DialogDescription>
              Help us understand why this campaign should be reviewed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason</Label>
            <Textarea
              placeholder="Describe your concern..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReport}
              loading={reportLoading}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{campaign.title}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
