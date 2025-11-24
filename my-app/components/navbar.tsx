/**
 * SECTION: Imports & Configuration
 * FUNCTION: Import necessary dependencies, components, and configure the file.
 * INCLUDED: "use client" directive, Next.js components, Lucide icons, UI components, Clerk auth, and hooks.
 */
"use client";

import Link from "next/link";
import {
  Trello,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, useUser, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";

/**
 * SECTION: Props Interface
 * FUNCTION: Define the expected props for the Navbar component.
 * INCLUDED: boardTitle (optional), onEditBoard (optional), onFilterClick (optional), filterCount (optional).
 */
interface Props {
  boardTitle?: string;
  onEditBoard?: () => void;

  onFilterClick?: () => void;
  filterCount?: number;
}

/**
 * SECTION: Navbar Component
 * FUNCTION: Main navigation component for the application.
 * INCLUDED: Logic for different page views (Dashboard, Board, Default) and user authentication state.
 */
export default function Navbar({
  boardTitle,
  onEditBoard,
  onFilterClick,
  filterCount = 0,
}: Props) {
  /**
   * SECTION: Hooks & State
   * FUNCTION: Initialize hooks and derive state variables.
   * INCLUDED: User authentication (useUser), current path (usePathname), and page type checks (isDashboardPage, isBoardPage).
   */
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const isDashboardPage = pathname === "/dashboard";
  const isBoardPage = pathname.startsWith("/boards/");

  /**
   * SECTION: Dashboard View
   * FUNCTION: Render the navbar specifically for the dashboard page.
   * INCLUDED: Trello logo, title, and UserButton.
   */
  if (isDashboardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              Trello Clone
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <UserButton />
          </div>
        </div>
      </header>
    );
  }

  /**
   * SECTION: Board View
   * FUNCTION: Render the navbar for a specific board page.
   * INCLUDED: Back button, Board title, Edit board button, Filter button, and UserButton.
   */
  if (isBoardPage) {
    return (
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Link
                href="/"
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back to dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                <Trello className="text-blue-600" />
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  <span className="text-lg font-bold text-gray-900 truncate">
                    {boardTitle}
                  </span>
                  {onEditBoard && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 flex-shrink-0 p-0"
                      onClick={onEditBoard}
                    >
                      <MoreHorizontal />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {onFilterClick && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs sm:text-sm ${
                    filterCount > 0 ? "bg-blue-100 border-blue-200" : ""
                  }`}
                  onClick={onFilterClick}
                >
                  <Filter className="h-3 w-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                  {filterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-xs ml-1 sm:ml-2 bg-blue-100 border-blue-200"
                    >
                      {filterCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  /**
   * SECTION: Default View
   * FUNCTION: Render the default navbar for pages like the landing page.
   * INCLUDED: Logo, Sign In/Sign Up buttons (if signed out), or Dashboard link/UserButton (if signed in).
   */
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            Trello Clone
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isSignedIn ? (
            isDashboardPage ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline text-sm text-gray-600">
                  Welcome,{" "}
                  {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress}
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline text-sm text-gray-600">
                  Welcome,{" "}
                  {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress}
                </span>
                <Link href="/">
                  <Button size="sm" className="text-xs sm:text-sm">
                    Dashboard <ArrowRight />
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            )
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <SignInButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="text-xs sm:text-sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
