'use client';

/**
 * Landing Page - Premium Marketing Page
 * 
 * Phase 06: Marketing landing page with hero section, features, pricing, testimonials, and FAQ.
 * Designed to convert visitors into users with clear value proposition.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Zap,
    Shield,
    Users,
    Key,
    CheckCircle2,
    ArrowRight,
    Star,
    BarChart3,
    Globe,
    Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';

export default function LandingPage() {
    const features = [
        {
            icon: Sparkles,
            title: 'AI-Powered Analysis',
            description: 'Leverage multiple AI models to analyze offers intelligently with contextual understanding.',
            color: 'text-purple-500'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Get instant results with optimized workflows and parallel processing capabilities.',
            color: 'text-yellow-500'
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Track your searches, analyze patterns, and make data-driven decisions with detailed insights.',
            color: 'text-blue-500'
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Work together with your team using shared workspaces and role-based access control.',
            color: 'text-green-500'
        },
        {
            icon: Key,
            title: 'BYOK Support',
            description: 'Bring your own API keys for unlimited usage with your preferred AI providers.',
            color: 'text-orange-500'
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'Bank-level encryption, secure API key storage, and GDPR-compliant data handling.',
            color: 'text-red-500'
        }
    ];

    const pricingTiers = [
        {
            name: 'Free Forever',
            price: '$0',
            period: '/month',
            description: 'Perfect for getting started',
            features: [
                'AI-powered analysis with free models',
                '100 searches per day',
                '1 workspace',
                'Basic analytics',
                'Community support',
                'Open source'
            ],
            cta: 'Start Free',
            popular: false
        },
        {
            name: 'BYOK',
            price: 'Pay as you go',
            period: '',
            description: 'Unlimited power with your keys',
            features: [
                'All free features',
                'Unlimited searches',
                'Premium AI models (GPT-4, Claude)',
                '3 BYOK API keys',
                'Advanced analytics',
                'Priority support',
                'No platform fees'
            ],
            cta: 'Add Your Keys',
            popular: true
        }
    ];

    const testimonials = [
        {
            name: 'Sarah Chen',
            role: 'Real Estate Investor',
            company: 'Chen Properties',
            content: 'OfferAnalyst helped me analyze 500+ properties in minutes. The AI insights are incredibly accurate.',
            rating: 5
        },
        {
            name: 'Marcus Johnson',
            role: 'Tech Recruiter',
            company: 'TechTalent Pro',
            content: 'Game-changer for candidate evaluation. We reduced our screening time by 70% while improving quality.',
            rating: 5
        },
        {
            name: 'Elena Rodriguez',
            role: 'E-commerce Manager',
            company: 'ShopSmart Inc',
            content: 'The multi-model support is fantastic. We can compare products across different markets effortlessly.',
            rating: 5
        }
    ];

    const faqs = [
        {
            question: 'Is OfferAnalyst really free forever?',
            answer: 'Yes! Our core platform is 100% free with no hidden costs. You can use free AI models indefinitely. BYOK mode is optional if you want unlimited usage with premium models.'
        },
        {
            question: 'What is BYOK (Bring Your Own Key)?',
            answer: 'BYOK allows you to use your own API keys from AI providers like OpenAI, Anthropic, or Google. This removes all platform limits and lets you use premium models while paying your provider directly.'
        },
        {
            question: 'How secure are my API keys?',
            answer: 'Your API keys are encrypted with bcrypt before storage and never sent to the client. They\'re tied to your account and can be deleted anytime. We never share or log your keys.'
        },
        {
            question: 'Can I use OfferAnalyst for my team?',
            answer: 'Absolutely! You can invite team members to your workspace with different roles (Admin, Editor, Viewer). Collaborate on analyses and share insights seamlessly.'
        },
        {
            question: 'What AI models are supported?',
            answer: 'Free tier includes Gemini 2.5 Flash and DeepSeek R1. BYOK mode supports GPT-4, Claude Sonnet, Mistral Large, and many more through OpenRouter.'
        },
        {
            question: 'Do you offer enterprise plans?',
            answer: 'Our BYOK model works great for enterprises. For custom SLAs, dedicated support, or special requirements, contact us at enterprise@offeranalyst.com.'
        }
    ];

    const trustBadges = [
        { icon: Shield, label: 'GDPR Compliant' },
        { icon: Lock, label: 'Bank-Level Encryption' },
        { icon: Globe, label: 'Privacy First' },
        { icon: CheckCircle2, label: '99.9% Uptime' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 opacity-50" />
                
                <div className="container mx-auto relative z-10 max-w-6xl">
                    <motion.div {...fadeInUpProps} className="text-center mb-12">
                        <Badge className="mb-4 px-4 py-2 text-sm" variant="outline">
                            <Sparkles className="w-4 h-4 mr-2 inline" />
                            AI-Powered Contextual Analysis
                        </Badge>
                        
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                            Analyze. Compare. Decide.
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                            AI-powered offer analysis that helps you make data-driven decisions in seconds, not hours.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/signup">
                                <Button size="lg" className="text-lg px-8">
                                    Start Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/dashboard/support">
                                <Button size="lg" variant="outline" className="text-lg px-8">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="mt-8 flex flex-wrap justify-center gap-6">
                            {trustBadges.map((badge, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <badge.icon className="w-4 h-4" />
                                    <span>{badge.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-background/50">
                <div className="container mx-auto max-w-6xl">
                    <motion.div {...fadeInUpProps} className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-xl text-muted-foreground">
                            Everything you need to analyze offers intelligently
                        </p>
                    </motion.div>

                    <motion.div {...staggerContainerProps} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div key={index} {...staggerItemProps} custom={index}>
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                                        <CardTitle>{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-5xl">
                    <motion.div {...fadeInUpProps} className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-muted-foreground">
                            Start free, upgrade when you need more power
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {pricingTiers.map((tier, index) => (
                            <motion.div
                                key={index}
                                {...staggerItemProps}
                                custom={index}
                                className={tier.popular ? 'md:scale-105' : ''}
                            >
                                <Card className={`h-full ${tier.popular ? 'border-primary shadow-xl' : ''}`}>
                                    {tier.popular && (
                                        <div className="bg-primary text-primary-foreground text-center py-2 font-semibold">
                                            Most Popular
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                        <div className="text-4xl font-bold">
                                            {tier.price}
                                            <span className="text-lg font-normal text-muted-foreground">
                                                {tier.period}
                                            </span>
                                        </div>
                                        <CardDescription>{tier.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3 mb-6">
                                            {tier.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href={index === 0 ? '/auth/signup' : '/dashboard/api-keys'}>
                                            <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                                                {tier.cta}
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-4 bg-accent/20">
                <div className="container mx-auto max-w-6xl">
                    <motion.div {...fadeInUpProps} className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Loved by Professionals</h2>
                        <p className="text-xl text-muted-foreground">
                            See what our users are saying
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div key={index} {...staggerItemProps} custom={index}>
                                <Card className="h-full">
                                    <CardContent className="pt-6">
                                        <div className="flex mb-4">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-muted-foreground mb-6 italic">
                                            &quot;{testimonial.content}&quot;
                                        </p>
                                        <div>
                                            <p className="font-semibold">{testimonial.name}</p>
                                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                            <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <motion.div {...fadeInUpProps} className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-muted-foreground">
                            Everything you need to know
                        </p>
                    </motion.div>

                    <motion.div {...staggerContainerProps} className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div key={index} {...staggerItemProps} custom={index}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{faq.answer}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10">
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.div {...fadeInUpProps}>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Make Better Decisions?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8">
                            Join thousands of professionals using AI to analyze offers smarter
                        </p>
                        <Link href="/auth/signup">
                            <Button size="lg" className="text-lg px-12">
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            No credit card required • Free forever • Upgrade anytime
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background border-t py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-6 h-6 text-primary" />
                                <span className="font-bold text-lg">OfferAnalyst</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                AI-powered contextual analysis platform
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/dashboard/support">Features</Link></li>
                                <li><Link href="/landing">Pricing</Link></li>
                                <li><Link href="/dashboard/api-keys">BYOK</Link></li>
                                <li><Link href="/dashboard/analytics">Analytics</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/docs">Documentation</Link></li>
                                <li><Link href="/dashboard/support">Support</Link></li>
                                <li><Link href="/admin">Admin</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/privacy">Privacy Policy</Link></li>
                                <li><Link href="/terms">Terms of Service</Link></li>
                                <li><Link href="/cookies">Cookie Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                        <p>&copy; 2026 OfferAnalyst. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
