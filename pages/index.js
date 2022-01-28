import	React					from	'react';
import	FlipMove				from	'react-flip-move';
import	usePrices				from	'contexts/usePrices';
import	useWeb3					from	'contexts/useWeb3';
import	IconCopy				from	'components/icons/IconCopy';
import	IconArrowDown			from	'components/icons/IconArrowDown';
import	BUYBACKS				from	'public/buybacks.json';
import	{truncateHex, formatAmount, formatDate, sortByKey, sum}			from	'utils';

function	RowHead({sortBy, set_sortBy}) {
	return (
		<div className={'flex flex-row py-3 px-6 w-full bg-gray-blue-3 rounded-sm'}>
			<div className={'pr-4'}>
				<div className={'flex flex-row items-center w-42'}>
					<p className={'pr-1 text-gray-blue-1'}>{'Timestamp'}</p>
					<div
						onClick={() => set_sortBy(n => n === 'time' ? '-time' : n === '-time' ? '' : 'time')}
						className={`p-1 -m-1 cursor-pointer transition-all transform ${sortBy === 'time' ? 'text-dark-blue-1 pt-2' : sortBy === '-time' ? 'text-dark-blue-1 rotate-180 pb-2' : 'text-gray-blue-2 hover:text-dark-blue-1 hover:opacity-60 pt-2'}`}>
						<IconArrowDown />
					</div>
				</div>
			</div>
			<div className={'pr-8'}>
				<div className={'flex flex-row items-center w-42'}>
					<p className={'pr-1 text-gray-blue-1'}>{'YFI Amount'}</p>
					<div
						onClick={() => set_sortBy(n => n === 'yfi' ? '-yfi' : n === '-yfi' ? '' : 'yfi')}
						className={`p-1 -m-1 cursor-pointer transition-all transform ${sortBy === 'yfi' ? 'text-dark-blue-1 pt-2' : sortBy === '-yfi' ? 'text-dark-blue-1 rotate-180 pb-2' : 'text-gray-blue-2 hover:text-dark-blue-1 hover:opacity-60 pt-2'}`}>
						<IconArrowDown />
					</div>
				</div>
			</div>
			<div className={'pr-6'}>
				<div className={'flex flex-row items-center w-38'}>
					<p className={'pr-1 text-gray-blue-1'}>{'Value'}</p>
					<div
						onClick={() => set_sortBy(n => n === 'value' ? '-value' : n === '-value' ? '' : 'value')}
						className={`p-1 -m-1 cursor-pointer transition-all transform ${sortBy === 'value' ? 'text-dark-blue-1 pt-2' : sortBy === '-value' ? 'text-dark-blue-1 rotate-180 pb-2' : 'text-gray-blue-2 hover:text-dark-blue-1 hover:opacity-60 pt-2'}`}>
						<IconArrowDown />
					</div>
				</div>
			</div>
			<div className={'pr-6'}>
				<div className={'w-50 text-gray-blue-1'}>{'Amount'}</div>
			</div>
			<div className={'pr-8'}>
				<div className={'w-28 text-gray-blue-1'}>{'Token'}</div>
			</div>
			<div className={'pr-14'}>
				<div className={'w-48 text-gray-blue-1'}>{'Tx Hash'}</div>
			</div>
		</div>
	);
}

function	Row({row}) {
	const	[isUriCopied, set_isUriCopied] = React.useState(false);
	return (
		<>
			<div className={'mr-4'}>
				<div className={'w-42 tabular-nums text-gray-blue-1'}>{formatDate(new Date(row.timestamp))}</div>
			</div>
			<div className={'mr-8'}>
				<div className={'w-42 tabular-nums text-gray-blue-1'}>{formatAmount(row.yfiAmount, 12)}</div>
			</div>
			<div className={'mr-6'}>
				<div className={'w-38 tabular-nums text-gray-blue-1'}>{`$ ${formatAmount(row.usdValue)}`}</div>
			</div>
			<div className={'mr-6'}>
				<div className={'w-50 tabular-nums text-gray-blue-1'}>{formatAmount(row.tokenAmount, 12)}</div>
			</div>
			<div className={'mr-8'}>
				<div className={'w-28 text-gray-blue-1'}>{row.token}</div>
			</div>
			<div className={'mr-6'}>
				<div className={'w-48 tabular-nums text-gray-blue-1'}>{truncateHex(row.hash, 9)}</div>
			</div>
			<div
				onClick={(e) => {
					e.stopPropagation();
					set_isUriCopied(true);
					navigator.clipboard.writeText(`https://etherscan.io/tx/${row.hash}`);
					setTimeout(() => set_isUriCopied(false), 1500);
				}}
				className={`p-2 -m-1 -ml-1.5 ${isUriCopied ? 'text-yearn-blue hover:text-yearn-blue cursor-auto' : 'text-gray-blue-1 hover:text-gray-blue-2 cursor-copy'} transition-colors`}>
				<IconCopy />
			</div>
		</>
	);
}

function	RowFooter({data}) {
	return (
		<div className={'flex flex-row items-center py-3 px-6 w-full bg-gray-blue-3 rounded-sm'}>
			<div className={'mr-4'}>
				<div className={'w-42 font-bold tabular-nums text-dark-blue-1'}>{'Total'}</div>
			</div>
			<div className={'mr-8'}>
				<div className={'w-42 font-bold tabular-nums text-dark-blue-1'}>{formatAmount(sum(...data.map(e => e.yfiAmount)), 12)}</div>
			</div>
			<div className={'mr-6'}>
				<div className={'w-38 font-bold tabular-nums text-dark-blue-1'}>{`$ ${formatAmount(sum(...data.map(e => e.usdValue)), 2)}`}</div>
			</div>
			<div className={'mr-6'}>
				<div className={'w-50'}>{''}</div>
			</div>
			<div className={'mr-8'}>
				<div className={'w-28'}>{''}</div>
			</div>
			<div className={'ml-2'}>
				<div className={'flex justify-end w-56'}>
					<button className={'button-small button-filled'}>
						<p className={'font-normal'}>{'Export CSV'}</p>
					</button>
				</div>
			</div>
		</div>
	);
}

function	Index() {
	const	{prices} = usePrices();
	const	{active, address, ens, openLoginModal, deactivate, onDesactivate} = useWeb3();
	const	[sortBy, set_sortBy] = React.useState('time');
	const	[sortedData, set_sortedData] = React.useState([...BUYBACKS].reverse());

	React.useEffect(() => {
		let _data = BUYBACKS.map(a => {return {...a};});

		if (sortBy === 'time') {
			_data = sortByKey(_data, 'timestamp', -1);
		} else if (sortBy === 'yfi') {
			_data = sortByKey(_data, 'yfiAmount', -1);
		} else if (sortBy === 'value') {
			_data = sortByKey(_data, 'usdValue', -1);
		}
		set_sortedData(_data);
	}, [sortBy]);

	return (
		<div className={'w-full'}>
			<div className={'flex justify-between items-center p-6 my-4 w-full h-20 bg-white rounded-sm'}>
				<div className={'flex flex-row items-center'}>
					<h2 className={'mr-4 text-lg font-bold text-dark-blue-1'}>
						{'YFI Buyback'}
					</h2>
					<p className={'text-xs text-gray-blue-1'}>
						{`Last update: ${formatDate(new Date(BUYBACKS[BUYBACKS.length - 1].timestamp))}`}
					</p>
				</div>
				<div className={'flex flex-row items-center space-x-6'}>
					<p className={'text-yearn-blue'}>{`YFI $ ${formatAmount(prices?.['yearn-finance']?.usd || 0, 2)}`}</p>
					<p className={'text-yearn-blue'}>{'Balance: 0 YFI'}</p>
					<a href={'https://cowswap.exchange/#/swap?outputCurrency=0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'} target={'_blank'} rel={'noreferrer'}>
						<button className={'button-small button-light'}>{'Buy YFI'}</button>
					</a>
					<button
						onClick={() => {
							if (active) {
								deactivate();
								onDesactivate();
							} else {
								openLoginModal();
							}
						}}
						className={'truncate button-small button-light'}>
						{!active ? 'Connect wallet' : ens ? ens : truncateHex(address, 4)}
					</button>
				</div>
			</div>

			<div>
				<RowHead sortBy={sortBy} set_sortBy={set_sortBy} />
				<FlipMove duration={250} easing={'ease-in-out'} enterAnimation={'none'}>
					{sortedData?.map((row, index) => (
						<div key={row.id} className={`flex flex-row py-3 px-6 w-full items-center ${index % 2 ? 'bg-white' : 'bg-white-blue-1'} rounded-sm relative mb-0.5`}>
							<Row row={row} />
						</div>
					))}
				</FlipMove>
				<RowFooter data={BUYBACKS} />
			</div>

		</div>
	);
}

export default Index;
