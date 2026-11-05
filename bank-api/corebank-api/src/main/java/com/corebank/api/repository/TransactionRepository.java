package com.corebank.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.corebank.api.model.entity.Transaction;
import java.util.UUID;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Extrato: transações em que a conta é origem ou destino, da mais recente para a mais antiga
    List<Transaction> findBySourceAccountIdOrTargetAccountIdOrderByCreatedAtDesc(UUID sourceId, UUID targetId);
}