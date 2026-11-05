package com.corebank.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.corebank.api.dto.TransactionResponseDTO;
import com.corebank.api.model.entity.Account;
import com.corebank.api.model.entity.Transaction;
import com.corebank.api.model.enums.AccountStatus;
import com.corebank.api.model.enums.TransactionStatus;
import com.corebank.api.model.enums.TransactionType;
import com.corebank.api.repository.AccountRepository;
import com.corebank.api.repository.TransactionRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public Transaction processTransfer(String userEmail, UUID sourceId, UUID targetId,
                                       BigDecimal amount, String description) {

        if (sourceId.equals(targetId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A conta de origem e a de destino devem ser diferentes");
        }

        // A origem precisa ser do usuário logado; o destino pode ser de qualquer pessoa
        Account source = accountRepository.findByIdAndUserEmail(sourceId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta de origem não encontrada"));

        Account target = accountRepository.findById(targetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta de destino não encontrada"));

        requireActive(source, "origem");
        requireActive(target, "destino");

        if (source.getBalance().compareTo(amount) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Saldo insuficiente");
        }

        source.setBalance(source.getBalance().subtract(amount));
        target.setBalance(target.getBalance().add(amount));
        accountRepository.save(source);
        accountRepository.save(target);

        Transaction transaction = Transaction.builder()
                .sourceAccount(source)
                .targetAccount(target)
                .amount(amount)
                .type(TransactionType.TRANSFER_OUT)
                .status(TransactionStatus.COMPLETED)
                .description(description)
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction processDeposit(String userEmail, UUID accountId, BigDecimal amount) {
        // Só deposita na própria conta
        Account account = accountRepository.findByIdAndUserEmail(accountId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada"));

        requireActive(account, "de destino");

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .targetAccount(account)
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description("Depósito bancário")
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getStatement(String userEmail, UUID accountId) {
        Account account = accountRepository.findByIdAndUserEmail(accountId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada"));

        return transactionRepository
                .findBySourceAccountIdOrTargetAccountIdOrderByCreatedAtDesc(account.getId(), account.getId())
                .stream()
                .map(TransactionResponseDTO::from)
                .toList();
    }

    private void requireActive(Account account, String role) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A conta " + role + " não está ativa");
        }
    }
}