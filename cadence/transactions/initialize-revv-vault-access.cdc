import "REVVVaultAccess"

transaction() {
    let adminRef: &REVVVaultAccess.Admin

    prepare(acct: auth(BorrowValue) &Account) {
        self.adminRef = acct.storage.borrow<&REVVVaultAccess.Admin>(from: REVVVaultAccess.AdminStoragePath)!     
    }
    execute {
        REVVVaultAccess.initialize(adminRef: self.adminRef)
    }
}