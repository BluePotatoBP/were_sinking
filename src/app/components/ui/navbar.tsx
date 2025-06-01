'use client';
import Image from "next/image";
import Link from "next/link";
import { getAppVersion } from "@/app/utils/hooks";

const Navbar = () => {
	return (
		<nav>
			<div className="fixed left-0 top-0 px-8 flex w-full justify-between items-center leading-none dark:text-white/20 text-zinc-800/20 border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-slate-700/30 dark:from-inherit lg:static lg:w-auto lg:rounded-b-xl lg:border lg:bg-gray-200 lg:px-8 lg:py-4 lg:dark:bg-zinc-800/30">
				<div className="icon text-4xl select-none hover:animate-pulse leading-none" draggable={false}>
					<Link href='/'><Image src="/images/logo.svg" priority width={30} height={30} alt="logo" className="opacity-80 dark:opacity-10" /></Link>
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