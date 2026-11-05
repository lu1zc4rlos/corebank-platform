package com.corebank.api.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.corebank.api.dto.AccountResponseDTO;
import com.corebank.api.dto.TransactionResponseDTO;
import com.corebank.api.service.AccountService;
import com.corebank.api.service.TransactionService;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final TransactionService transactionService;

    public AccountController(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    // Lista as contas do usuário logado (é aqui que o front descobre o accountId)
    @GetMapping
    public ResponseEntity<List<AccountResponseDTO>> getMyAccounts(Authentication authentication) {
        List<AccountResponseDTO> accounts = accountService.findByOwner(authentication.getName())
                .stream()
                .map(AccountResponseDTO::from)
                .toList();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(accountService.findOwnedAccount(id, authentication.getName()).getBalance());
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionResponseDTO>> getStatement(@PathVariable UUID id,
                                                                     Authentication authentication) {
        return ResponseEntity.ok(transactionService.getStatement(authentication.getName(), id));
    }
}