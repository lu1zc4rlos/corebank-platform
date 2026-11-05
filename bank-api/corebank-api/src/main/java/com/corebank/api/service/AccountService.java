package com.corebank.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.corebank.api.repository.AccountRepository;
import com.corebank.api.model.entity.Account;
import com.corebank.api.model.entity.User;
import com.corebank.api.model.enums.AccountStatus;
import com.corebank.api.model.enums.AccountType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Account openAccount(User user) {
        Account newAccount = new Account();

        newAccount.setUser(user);
        newAccount.setBalance(BigDecimal.ZERO);
        newAccount.setStatus(AccountStatus.ACTIVE);
        newAccount.setNumber(generateAccountNumber());
        newAccount.setBranch("0001"); // Agência padrão
        newAccount.setType(AccountType.CHECKING);

        return accountRepository.save(newAccount);
    }

    private String generateAccountNumber() {
        int randomNum = (int) (Math.random() * 90000000) + 10000000;
        return String.valueOf(randomNum);
    }

    // Conta que pertence ao usuário logado; se não for dele, responde 404 (não revela que existe)
    @Transactional(readOnly = true)
    public Account findOwnedAccount(UUID id, String ownerEmail) {
        return accountRepository.findByIdAndUserEmail(id, ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Account> findByOwner(String ownerEmail) {
        return accountRepository.findByUserEmailOrderByCreatedAtAsc(ownerEmail);
    }
}