"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Examples of common query parameter patterns in Next.js 15 App Router
 */

// Example 1: Reading query parameters
export function ReadQueryParams() {
	const searchParams = useSearchParams();
	
	// Get individual params
	const page = searchParams.get('page') || '1';
	const search = searchParams.get('search') || '';
	const filter = searchParams.get('filter');
	
	// Get all params as an object
	const allParams: Record<string, string> = {};
	searchParams.forEach((value, key) => {
		allParams[key] = value;
	});
	
	return (
		<div>
			<p>Page: {page}</p>
			<p>Search: {search}</p>
			<p>Filter: {filter || 'none'}</p>
			<pre>{JSON.stringify(allParams, null, 2)}</pre>
		</div>
	);
}

// Example 2: Updating query parameters
export function UpdateQueryParams() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	
	const updateParam = (key: string, value: string) => {
		// Create a new URLSearchParams object from the current params
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		
		// Update the specific parameter
		if (value) {
			current.set(key, value);
		} else {
			current.delete(key);
		}
		
		// Build the new URL and navigate
		const search = current.toString();
		const query = search ? `?${search}` : '';
		router.push(`${pathname}${query}`);
	};
	
	const updateMultipleParams = (updates: Record<string, string | null>) => {
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		
		Object.entries(updates).forEach(([key, value]) => {
			if (value === null || value === '') {
				current.delete(key);
			} else {
				current.set(key, value);
			}
		});
		
		const search = current.toString();
		const query = search ? `?${search}` : '';
		router.push(`${pathname}${query}`);
	};
	
	return (
		<div className="space-y-2">
			<button onClick={() => updateParam('page', '2')}>
				Go to Page 2
			</button>
			<button onClick={() => updateParam('filter', 'active')}>
				Set Active Filter
			</button>
			<button onClick={() => updateMultipleParams({ page: '1', filter: null })}>
				Reset to Page 1 & Clear Filter
			</button>
		</div>
	);
}

// Example 3: Migration from Pages Router
export function MigrationExample() {
	// OLD WAY (Pages Router):
	// const router = useRouter();
	// const { id, category } = router.query;
	// router.push({
	//   pathname: '/products',
	//   query: { category: 'electronics', page: 1 }
	// });
	
	// NEW WAY (App Router):
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	
	// Reading params
	const id = searchParams.get('id');
	const category = searchParams.get('category');
	
	// Navigating with params
	const navigateWithParams = () => {
		const params = new URLSearchParams({
			category: 'electronics',
			page: '1'
		});
		router.push(`/products?${params.toString()}`);
	};
	
	// Preserving existing params while adding new ones
	const addParam = (key: string, value: string) => {
		const current = new URLSearchParams(searchParams.toString());
		current.set(key, value);
		router.push(`${pathname}?${current.toString()}`);
	};
	
	return (
		<div>
			<p>ID: {id}</p>
			<p>Category: {category}</p>
			<button onClick={navigateWithParams}>Go to Electronics</button>
			<button onClick={() => addParam('sort', 'price')}>Add Sort</button>
		</div>
	);
}

// Example 4: Server Component with searchParams
interface PageProps {
	searchParams: { [key: string]: string | string[] | undefined };
}

// This would be in a page.tsx file
export function ServerComponentExample({ searchParams }: PageProps) {
	// Direct access to params in server components
	const page = searchParams.page || '1';
	const search = searchParams.search || '';
	
	// Handle array params (when same key appears multiple times)
	const tags = Array.isArray(searchParams.tags) 
		? searchParams.tags 
		: searchParams.tags 
		? [searchParams.tags] 
		: [];
	
	return (
		<div>
			<h1>Server Component</h1>
			<p>Page: {page}</p>
			<p>Search: {search}</p>
			<p>Tags: {tags.join(', ')}</p>
		</div>
	);
}