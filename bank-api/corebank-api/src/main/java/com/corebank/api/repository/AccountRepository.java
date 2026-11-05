package com.corebank.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.corebank.api.model.entity.Account;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    // Busca a conta SOMENTE se ela pertencer ao usuário com esse e-mail
    Optional<Account> findByIdAndUserEmail(UUID id, String email);

    // Todas as contas de um usuário
    List<Account> findByUserEmailOrderByCreatedAtAsc(String email);
}