
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const Faq = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600 rounded-lg">
                            <HelpCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Frequently Asked Questions</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Common questions about using the CRM system.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>General Usage</CardTitle>
                        <CardDescription>Basics of navigating and using the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                                <AccordionContent>
                                    If you are logged in, go to your User Profile menu (top right) and select "Account".
                                    If you cannot log in, please contact your system administrator to initiate a password reset.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>What is the difference between a Lead and a Client?</AccordionTrigger>
                                <AccordionContent>
                                    A <strong>Lead</strong> is a potential opportunity or interested party that has not yet purchased a service.
                                    A <strong>Client</strong> is an entity that has an established relationship with us.
                                    Leads can be converted into Clients once they close a deal.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sales & Pipelines</CardTitle>
                        <CardDescription>Managing your sales process.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-3">
                                <AccordionTrigger>How do Pipelines work?</AccordionTrigger>
                                <AccordionContent>
                                    Pipelines represent your sales process. Each pipeline is made up of multiple <strong>Stages</strong> (e.g., Prospecting, Negotiation, Closed).
                                    You can move Leads between stages to track their progress towards a sale.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>Can I customize the stages?</AccordionTrigger>
                                <AccordionContent>
                                    Yes! Administrators can create custom Pipelines and define their own Stages with specific colors and ordering in the Pipelines configuration section.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Advanced Features</CardTitle>
                        <CardDescription>Webhooks and Integrations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-5">
                                <AccordionTrigger>What are Webhooks?</AccordionTrigger>
                                <AccordionContent>
                                    Webhooks allow the CRM to automatically notify other systems when events happen (like a new Lead or updated Client).
                                    You can configure them in the Webhooks section.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-6">
                                <AccordionTrigger>How do I test the API?</AccordionTrigger>
                                <AccordionContent>
                                    Please refer to our <a href="/api" className="text-blue-600 underline font-medium">API Documentation</a> for detailed guides on how to authenticate and make requests to our API endpoints.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <div className="text-center text-sm text-muted-foreground pt-8">
                    Still have questions? Contact support at <a href="mailto:project@codex.academy" className="underline">project@codex.academy</a>
                </div>

            </div>
        </div>
    );
};
