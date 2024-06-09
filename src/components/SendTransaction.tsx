import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AccountInfo, Keypair, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, Transaction, TransactionMessage, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import axios, { AxiosResponse } from 'axios';
import { SPVProxyResponse } from 'pages/api/proxy';
import { FC, useCallback } from 'react';
import { monitorAndVerifyUpdates } from 'spv/client';
import { COPY_PROGRAM_ID, getCopyProgram } from 'spv/program';
import { notify } from "../utils/notifications";

export const SendTransaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction,signTransaction } = useWallet();

    const onClick = useCallback(async () => {

        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';
        try {
  const copyProgram = getCopyProgram("http://" + (process.env.NEXT_PUBLIC_HOST || "127.0.0.1") + ":8899",Keypair.generate().secretKey,COPY_PROGRAM_ID);
	// ;
let toAccount = new PublicKey("gvtVGeQAm5e1fprqZt3xmzTuTWKdTbbytr269wv4yS6");

let [account_for_proof,bump] = PublicKey.findProgramAddressSync([Buffer.from("copy_hash")],copyProgram.programId)
console.log("account_for_proof: ",account_for_proof);
  let spv_ix = await copyProgram.methods.copyHash(bump).accounts({
    copyAccount: account_for_proof,
    sourceAccount: account_for_proof,
    clock: SYSVAR_CLOCK_PUBKEY,
    systemProgram: SystemProgram.programId,
    creator: publicKey
  }).instruction();
  // console.log("txn_hash:",txn)

            // Create instructions to send, in this case a simple transfer
            const instructions = [
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: toAccount,
                    lamports: 1_000,
                }),
                spv_ix
            ];

            // Get the lates block hash to use on our transaction and confirmation
            // let latestBlockhash = await connection.getLatestBlockhash()
            let txn = new Transaction().add(instructions[0]).add(instructions[1]);
            // Create a new TransactionMessage with version and compile it to legacy
            // const messageLegacy = new TransactionMessage({
            //     payerKey: publicKey,
            //     recentBlockhash: latestBlockhash.blockhash,
            //     instructions,
            // }).compileToLegacyMessage();

            // Create a new VersionedTransacction which supports legacy and v0
            // const transation = new VersionedTransaction(messageLegacy)
             	let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
              txn.recentBlockhash = blockhash;
							txn.feePayer = publicKey;

						  txn = await signTransaction(txn);
            // Send transaction and await for signature
        //     signature = await connection.sendRawTransaction(txn.serialize(),{
								// 	skipPreflight: true,
								//
								// });
  let account_state = await copyProgram.provider.connection.getAccountInfo(account_for_proof,"processed");
								let spv_proxy_response: AxiosResponse<SPVProxyResponse> = await axios.post("/api/proxy",{
											txn: txn.serialize().toString("base64")
										})
          console.log("done",spv_proxy_response.data.update)

            // Send transaction and await for signature
            // await connection.confirmTransaction({ signature, ...latestBlockhash }, 'processed');
						// console.log("not")

 // let spv_res = true
  let spv_res = await monitorAndVerifyUpdates(account_for_proof,account_state as AccountInfo<Buffer>,copyProgram,bump,"145.40.125.153",spv_proxy_response.data.update);
            console.log(spv_res);
           spv_res && notify({ type: 'success', message: 'SPV & Txn successful!', txid: spv_proxy_response.data.signature});
					 !spv_res && notify({ type: 'error', message: 'Transaction successful but spv fails', txid: spv_proxy_response.data.signature });
        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [publicKey, notify, connection, sendTransaction]);

    return (
        <div className="flex flex-row justify-center">
            <div className="relative group items-center">
                <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <button
                        className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={onClick} disabled={!publicKey}
                    >
                        <div className="hidden group-disabled:block ">
                        Wallet not connected
                        </div>
                         <span className="block group-disabled:hidden" >
                            Send Transaction
                        </span>
                    </button>
             </div>
        </div>
    );
};
