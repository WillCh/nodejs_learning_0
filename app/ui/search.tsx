'use client'; 
// This is a Client Component, which means you can use event listeners and hooks.

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter  } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  // the debounced callback is used to not to trigger a backend sql run at each char typing, it will only run callback every 300ms if no user action.
  const handleSearch = useDebouncedCallback((term) => {
    // URLSearchParams is a Web API that provides utility methods for manipulating the URL query parameters.
    //  you can use it to get the params string like ?page=1&query=a
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    console.log(term);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    // Update the url with params.
    // ${pathname} is the current path, in your case, "/dashboard/invoices".
    replace(`${pathname}?${params.toString()}`);
  }, 300);
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        // makes the search bar content the same as the current url.
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
