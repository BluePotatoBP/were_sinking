const Navbar = () => {
	return (
		<nav>
			<div className="fixed left-0 top-0 px-8 flex w-full justify-between items-center leading-none dark:text-white/20 text-zinc-800/20 border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-slate-700/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:px-8 lg:py-4 lg:dark:bg-zinc-800/30">
				<div className="icon text-4xl select-none" draggable={false}>
					&#9863;
				</div>
				<div className="version-number">
					v0.5
				</div>
			</div>
		</nav>
	);
};

export default Navbar;