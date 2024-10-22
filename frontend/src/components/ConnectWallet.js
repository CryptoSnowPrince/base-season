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
                    <div className="button"
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
                                    <button className="connect-wallet-button"
                                        onClick={openConnectModal}
                                    >
                                        connect wallet.
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button className="connect-wallet-button"
                                        onClick={openChainModal}
                                    >
                                        Wrong Network
                                    </button>
                                );
                            }
                            return (
                                <div style={{ display: 'flex', gap: window.innerWidth > 540 ? 12 : 5 }}>
                                    <button className="connect-wallet-button"
                                        style={{ width: window.innerWidth > 540 ? "200px" : "250px" }}
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
