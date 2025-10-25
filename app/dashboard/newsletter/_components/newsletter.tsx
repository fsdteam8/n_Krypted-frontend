"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import QuillEditor from "../../blogs/_components/QuillEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Mail, Users, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/subscribers`
      );
      const data = await response.json();

      if (response.ok) {
        setSubscribers(data.subscribers || data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch subscribers",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          "Failed to connect to backend. Make sure your Express server is running.",
        variant: "destructive",
      }); 
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  // Delete subscriber
  const deleteSubscriber = async (email: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubscribers(subscribers.filter((sub) => sub.email !== email));
        toast({
          title: "Success",
          description: "Subscriber deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete subscriber",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
      console.log(error)
    }
  };

  // Send newsletter
  const sendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Subject and content are required",
        variant: "destructive",
      });
      return;
    }

    setSendingNewsletter(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, content }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Newsletter sent to ${subscribers.length} subscribers`,
        });
        setSubject("");
        setContent("");
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send newsletter",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to send newsletter",
        variant: "destructive",
      });
      console.log(error)
    } finally {
      setSendingNewsletter(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Newsletter Admin
            </h1>
            <p className="text-muted-foreground">
              Manage your newsletter subscribers
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="w-4 h-4 mr-2" />
                Send Newsletter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  Send Newsletter
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Send a newsletter to all {subscribers.length} subscribers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-card-foreground">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter newsletter subject"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="text-card-foreground">
                    Content
                  </Label>
                  <QuillEditor
                    id="content"
                    value={content}
                    onChange={(value) => setContent(value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendNewsletter}
                    disabled={sendingNewsletter}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {sendingNewsletter ? "Sending..." : "Send Newsletter"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {subscribers.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                This Month
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {
                  subscribers.filter((sub) => {
                    const subDate = new Date(sub.createdAt);
                    const now = new Date();
                    return (
                      subDate.getMonth() === now.getMonth() &&
                      subDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                This Week
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {
                  subscribers.filter((sub) => {
                    const subDate = new Date(sub.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return subDate >= weekAgo;
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscribers Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Subscribers</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your newsletter subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  Loading subscribers...
                </div>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  No subscribers found
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">
                      Email
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Subscribed Date
                    </TableHead>
                    <TableHead className="text-muted-foreground w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber._id} className="border-border">
                      <TableCell className="font-medium text-card-foreground">
                        {subscriber.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(subscriber.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSubscriber(subscriber.email)}
                          className="border-border text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
