'use client';
import Image from "next/image";
import Link from "next/link";
import { getAppVersion } from "@/app/utils/hooks";

const Navbar = () => {
	return (
		<nav className="sticky top-0 z-50 w-full">
			<div className="px-8 flex w-full justify-between items-center leading-none dark:text-white/50 text-neutral-800/50 backdrop-blur-2xl lg:static lg:w-auto lg:px-8 lg:py-4 bg-black/10 dark:bg-neutral-900/80 border-b border-neutral-200/20 dark:border-neutral-800/20">
				<div className="icon text-4xl select-none hover:animate-pulse leading-none" draggable={false}>
					<Link href='/'><Image src="/images/logo.svg" priority width={30} height={30} alt="logo" className="opacity-80 dark:opacity-50" /></Link>
				</div>
				<div className="right-nav-info flex flex-row text-nowrap gap-4">
					<Link href='/changelog' className="dark:hover:text-white/60 hover:text-black/60 transition-colors">Changelog</Link>
					<div className="version-number">v{getAppVersion()}</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;