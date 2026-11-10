package com.corebank.api.dto;

import com.corebank.api.model.entity.Transaction;
import com.corebank.api.model.enums.TransactionStatus;
import com.corebank.api.model.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionResponseDTO(
        UUID id,
        UUID sourceAccountId,
        UUID targetAccountId,
        BigDecimal amount,
        TransactionType type,
        TransactionStatus status,
        String description,
        LocalDateTime createdAt
) {
    public static TransactionResponseDTO from(Transaction t) {
        return new TransactionResponseDTO(
                t.getId(),
                t.getSourceAccount() != null ? t.getSourceAccount().getId() : null,
                t.getTargetAccount() != null ? t.getTargetAccount().getId() : null,
                t.getAmount(),
                t.getType(),
                t.getStatus(),
                t.getDescription(),
                t.getCreatedAt()
        );
    }
}