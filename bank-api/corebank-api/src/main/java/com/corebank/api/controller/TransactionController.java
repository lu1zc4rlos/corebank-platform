package com.corebank.api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.corebank.api.dto.DepositRequestDTO;
import com.corebank.api.dto.TransactionRequestDTO;
import com.corebank.api.dto.TransactionResponseDTO;
import com.corebank.api.model.entity.Transaction;
import com.corebank.api.service.TransactionService;

@RestController
@RequestMapping("/api/transacoes")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/transferencia")
    public ResponseEntity<TransactionResponseDTO> transfer(@Valid @RequestBody TransactionRequestDTO request,
                                                           Authentication authentication) {
        Transaction transaction = transactionService.processTransfer(
                authentication.getName(),
                request.sourceAccountId(),
                request.targetAccountId(),
                request.amount(),
                request.description()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(TransactionResponseDTO.from(transaction));
    }

    @PostMapping("/deposito")
    public ResponseEntity<TransactionResponseDTO> deposit(@Valid @RequestBody DepositRequestDTO request,
                                                          Authentication authentication) {
        Transaction transaction = transactionService.processDeposit(
                authentication.getName(),
                request.targetAccountId(),
                request.amount()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(TransactionResponseDTO.from(transaction));
    }
}