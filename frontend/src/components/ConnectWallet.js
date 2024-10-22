import Image from "next/image";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ConnectWallet = ({ tokenBal }) => {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');
                return (
                    <div className="connect_btn_wrapper"
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button className="connect_btn"
                                        onClick={openConnectModal}
                                    >
                                        Connect
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button className="connect_btn"
                                        onClick={openChainModal}
                                    >
                                        Wrong
                                    </button>
                                );
                            }
                            return (
                                <div style={{ display: 'flex', gap: window.innerWidth > 540 ? 12 : 5 }}>
                                    <button className="connect_btn"
                                        onClick={openChainModal}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: window.innerWidth > 540 ? "50px" : "27px",
                                            borderRadius: 0,
                                        }}
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                style={{
                                                    background: 'white',
                                                    width: window.innerWidth > 540 ? 36 : 23,
                                                    height: window.innerWidth > 540 ? 36 : 23,
                                                    paddingLeft: window.innerWidth > 540 ? 3 : 4,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderColor: 'block'
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <Image
                                                        alt={chain.name ?? 'Base'}
                                                        src={chain.iconUrl}
                                                        width={30}
                                                        height={30}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </button>
                                    <button className="connect_btn"
                                        style={{ width: window.innerWidth > 540 ? "200px" : "195px" }}
                                        onClick={() => {
                                            console.log('tokenBal: ', tokenBal)
                                            openAccountModal()
                                        }}>
                                        {account.displayName}
                                        {tokenBal >= 0
                                            ? ` (${tokenBal > 1000_000 ?
                                                `${(tokenBal / 1000_000).toFixed(1)}M` :
                                                (tokenBal > 1000 ? `${(tokenBal / 1000).toFixed(1)}K` : tokenBal)} BSE)`
                                            : ''}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};

export default ConnectWallet;
