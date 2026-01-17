import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, MapPinOff, ArrowLeft, Home } from 'lucide-react';
import { Button } from './ui/button';

export const ErrorPage = ({ code = 404, title, message }) => {
    const navigate = useNavigate();

    const defaultConfig = {
        404: {
            icon: MapPinOff,
            title: "Page Not Found",
            message: "The page you are looking for doesn't exist or has been moved.",
            color: "text-blue-500"
        },
        403: {
            icon: ShieldAlert,
            title: "Access Denied",
            message: "You don't have permission to view this page.",
            color: "text-red-500"
        }
    };

    const config = defaultConfig[code] || defaultConfig[404];
    const Icon = config.icon;
    const displayTitle = title || config.title;
    const displayMessage = message || config.message;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-500">
            <div className={`mb-6 p-4 rounded-full bg-muted/30 ${config.color}`}>
                <Icon className="w-16 h-16" />
            </div>

            <h1 className="text-8xl font-black text-slate-200 dark:text-slate-800 mb-2 select-none">
                {code}
            </h1>

            <h2 className="text-3xl font-bold tracking-tight mb-3 text-foreground">
                {displayTitle}
            </h2>

            <p className="text-muted-foreground max-w-md mb-8 text-lg">
                {displayMessage}
            </p>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </Button>
                <Button onClick={() => navigate('/')} className="gap-2">
                    <Home className="w-4 h-4" /> Go Home
                </Button>
            </div>
        </div>
    );
};
