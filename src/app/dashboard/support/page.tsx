'use client';

/**
 * Support & Donations Page
 * 
 * Support information and voluntary donation options.
 * Features:
 * - "Buy me a coffee" donation button
 * - Free forever messaging
 * - BYOK FAQ
 * - Model recommendations
 * - Provider limits information
 */

import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Coffee, 
    Heart,
    HelpCircle,
    Zap,
    Key,
    Sparkles,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';

export default function SupportPage() {
    const benefits = [
        {
            icon: Zap,
            title: 'Free Forever',
            description: 'Core features are completely free with integrated AI models from multiple providers.'
        },
        {
            icon: Key,
            title: 'BYOK Support',
            description: 'Bring your own API keys for unlimited usage with no product-imposed limits.'
        },
        {
            icon: Heart,
            title: 'Voluntary Support',
            description: 'Donations are optional and help us keep the servers running and improve the platform.'
        }
    ];

    const faqs = [
        {
            question: 'How do I add my own API keys?',
            answer: 'Visit the API Keys page in your dashboard. Click "Add API Key", enter your provider name and key, and save. Your key is encrypted and never shared.'
        },
        {
            question: 'Which models are recommended for free tier?',
            answer: 'We recommend Gemini 3.5 Flash Lite (included by default) and NVIDIA Nemotron 3.5 Lightning (free) for fast extraction and structured parsing.'
        },
        {
            question: 'Which models should I use with BYOK?',
            answer: 'Claude 3.7 Sonnet, GPT-4o, and DeepSeek R1 offer state-of-the-art reasoning and precision. For large context windows, Kimi 2.6 (256k) is ideal. Mistral Large provides top European multilingual analysis.'
        },
        {
            question: 'What are the free tier limits?',
            answer: 'Free tier limits depend on the AI provider. Typically 100-200 requests per day across shared keys. BYOK removes all product limits.'
        },
        {
            question: 'Is my data private?',
            answer: 'Yes! Your searches, analyses, and API keys are private. We never share your data with third parties. API keys are encrypted at rest.'
        }
    ];

    const recommendedModels = [
        {
            tier: 'Free Tier',
            models: [
                { name: 'Gemini 3.5 Flash Lite', provider: 'Google', description: 'Default ultra-fast 1M context engine' },
                { name: 'NVIDIA Nemotron 3.5', provider: 'NVIDIA', description: 'Free GPU-accelerated lightning model' }
            ]
        },
        {
            tier: 'BYOK (Your Keys)',
            models: [
                { name: 'Claude 3.7 Sonnet', provider: 'Anthropic', description: 'Frontier hybrid reasoning' },
                { name: 'GPT-4o & o3-mini', provider: 'OpenAI', description: 'Multimodal flagship & high-speed STEM logic' },
                { name: 'DeepSeek R1 & V3', provider: 'DeepSeek', description: 'Deep reasoning & ultra-efficient MoE' },
                { name: 'Kimi 2.6', provider: 'Moonshot AI', description: 'Agentic multimodal with 256k context' },
                { name: 'Mistral Large', provider: 'Mistral AI', description: 'Premier European multilingual model' }
            ]
        }
    ];

    return (
        <ModernLayout>
            <div className="container mx-auto py-8 px-4 max-w-5xl">
                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2">Support OfferAnalyst</h1>
                    <p className="text-muted-foreground text-lg">
                        Help us keep this platform free forever
                    </p>
                </motion.div>

                <motion.div {...staggerContainerProps} className="space-y-8">
                    {/* Donation CTA */}
                    <motion.div {...staggerItemProps}>
                        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
                            <CardContent className="pt-8 text-center">
                                <Coffee className="w-16 h-16 mx-auto mb-4 text-primary" />
                                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                                    Buy Me a Coffee
                                    <Coffee className="w-6 h-6 text-primary inline" />
                                </h2>
                                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                    If you find OfferAnalyst helpful, consider supporting its development with a voluntary donation.
                                    Every coffee helps keep the servers running!
                                </p>
                                <Button size="lg" className="mb-4" asChild>
                                    <a
                                        href="https://buymeacoffee.com/cismch"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Heart className="w-5 h-5 mr-2" />
                                        Support with $5
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    100% optional • No pressure • Truly free forever
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Benefits */}
                    <motion.div {...staggerItemProps}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {benefits.map((benefit, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-6 text-center">
                                        <benefit.icon className="w-12 h-12 mx-auto mb-3 text-primary" />
                                        <h3 className="font-semibold mb-2">{benefit.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recommended Models */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Recommended Models
                                </CardTitle>
                                <CardDescription>
                                    Choose the right AI models for your needs
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {recommendedModels.map((tier, idx) => (
                                    <div key={idx}>
                                        <h3 className="font-semibold mb-3 text-lg">{tier.tier}</h3>
                                        <div className="space-y-2">
                                            {tier.models.map((model, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                >
                                                    <div>
                                                        <h4 className="font-medium">{model.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {model.provider} • {model.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* FAQ */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5" />
                                    Frequently Asked Questions
                                </CardTitle>
                                <CardDescription>
                                    Common questions about BYOK and platform usage
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                                        <h4 className="font-semibold mb-2">{faq.question}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {faq.answer}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Need More Help?</CardTitle>
                                <CardDescription>
                                    Get in touch with our support team
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    If you have questions not covered in the FAQ, feel free to reach out.
                                    We typically respond within 24-48 hours.
                                </p>
                                <Button variant="outline" asChild>
                                    <a href="mailto:support@offeranalyst.com">
                                        Contact Support
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </ModernLayout>
    );
}
