import { upgrades } from "hardhat";

async function main() {
  const toAddress = "0x00000";

  console.log('Transferring ownership of ProxyAdmin...');
  // The owner of the ProxyAdmin can upgrade our contracts
  await upgrades.admin.transferProxyAdminOwnership(toAddress);
  console.log('Transferred ownership of ProxyAdmin to:', toAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });